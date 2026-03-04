import { EventEmitter } from "node:events";
import { Socket } from "node:net";
import { TLSSocket, TLSSocketOptions } from "node:tls";
import { URL } from "node:url";
import { from, fromEvent, merge, of } from "rxjs";
import { filter, map, mergeMap, scan, takeUntil } from "rxjs/operators";
import { v4 } from "uuid";
import { escape, isAscii } from "validator";
import { default as configuration } from "./configuration";
import { db } from "./database";
import { InsertionError } from "./error";
import { default as logger } from "./logger";
import { default as constant } from "./constant";
import { clientIntroductionOccured, transactionRecipientsReceived } from "./helper";
import { default as secret } from "./secret";
import { CommandHistory, CommandOrUnknownCommand, LinesAccumulator, MessageAccumulator } from "./types";

//
const heloOrEhloCommandRegex = new RegExp(/(?:HELO|EHLO)\s*(.*)\s*?/);
const mailFromCommandRegex = new RegExp(/^MAIL FROM:[ \t]*<((?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\]))>[ \t]*/i);
const rcptToCommandRegex = new RegExp(/^RCPT TO:[ \t]*<((?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\]))>[ \t]*/i);

/**
 * Handles incoming connections to the server
 *
 * @param incomingMessage
 * @param serverResponse
 * @returns
 */
const connectionHandler = async (originalSocket: Socket) => {
  logger.debug('handle incoming connection');

  const createdAt = new Date();
  const uuid = v4();

  let connectionDocument;
  let activeSocket = originalSocket;


  try {
    // Insert the connection into the database
    connectionDocument = await db.collection('connections').insertOne({
      uuid,
      createdAt
    });
  }

  catch (error) {
    if (error instanceof Error) {
      logger.error('An error occurred when inserting the connection', { error: error.message });
    }
    else {
      logger.error('An error occurred when inserting the connection');
    }

    activeSocket.end();
    return;
  }

  const commandHistory: CommandHistory = [];

  const state = {
    dataTransmissionInProgress: false,
    mailTransactionInProgress: false,
  }

  const proxy = new EventEmitter();

  const message$ = fromEvent(proxy, 'data', (chunk: Buffer) => chunk.toString()).pipe(
    // Complete subscription when process is terminated, interrupted, exited, or an error occurs
    // or when the socket is closed
    takeUntil(
      merge(
        fromEvent(process, 'SIGINT'),
        fromEvent(process, 'SIGTERM'),
        fromEvent(process, 'exit'),
        fromEvent(process, 'uncaughtException'),
        fromEvent(process, 'unhandledRejection'),
        fromEvent(proxy, 'close'),
      )
    ),

    // Accumulate data into complete lines
    scan(
      (accumulated: MessageAccumulator, chunk: string) => {
        const line = accumulated.remaining + chunk;
        const lines = line.split('\r\n');
        const completeLines = lines.slice(0, -1);
        const remaining = lines.slice(-1)[0];
        const accumulatedLines = accumulated.lines || [];
        return {
          lines: [
            ...accumulatedLines,
            ...completeLines.map((data, index) => ({
              data,
              index: index + accumulatedLines.length,
            })),
          ],
          remaining,
        };
      },
      { lines: [], remaining: '' },
    ),

    // Strip the lines that have been emitted before, leaving only the new lines
    scan(
      (accumulated: LinesAccumulator, { lines }) => {
        const newLines = lines.slice(accumulated.emittedLinesCount);
        return {
          emittedLinesCount: accumulated.emittedLinesCount + newLines.length,
          lines: newLines,
        };
      },
      { emittedLinesCount: 0, lines: [] }
    ),

    // Emit each line separately
    mergeMap(({ lines }) => of(
      ...lines.map((line) => ({ line }))
    )),

    // Map to responses
    map(({ line }) => {
      const responses: Array<string | { message: string, callback: (() => void) }> = [];
      let command: CommandOrUnknownCommand = constant.COMMAND.UNKNOWN;
      responseGuard: {

        // If the data transmission is in progress then assume the command is DATA
        // and allow the switch case below to handle the rest
        if (state.dataTransmissionInProgress === true) {
          command = constant.COMMAND.DATA;
        }
        else {
          // Determine what the command is for this line, if there is one
          for (const entry of constant.COMMANDS) {
            const lineDataStartsWithCommand = line.data.startsWith(entry);

            if (lineDataStartsWithCommand === true) {
              command = entry;
              break;
            }
          }

          // Only push commands if line is not part of a data transmission
          commandHistory.push(command);
        }

        switch (command) {
          case constant.COMMAND.DATA: {
            logger.debug(`[${uuid}]: Received DATA command`);

            if (clientIntroductionOccured(commandHistory) === false) {
              logger.debug(`[${uuid}]: Client introduction has not occured`);
              responses.push(`${constant.STATUS_CODE.BAD_SEQUENCE_OF_COMMANDS} ${constant.ENHANCED_STATUS_CODE.MAIL_SYSTEM_UNABLE_TO_ACCEPT_MESSAGE_DUE_TO_POLICY_REASONS_PERMANENT} Error: send HELO first\r\n`);
              break responseGuard;
            }

            if (state.mailTransactionInProgress === false) {
              logger.debug(`[${uuid}]: Transaction is not in progress`);
              responses.push(`${constant.STATUS_CODE.BAD_SEQUENCE_OF_COMMANDS} ${constant.ENHANCED_STATUS_CODE.MAIL_SYSTEM_UNABLE_TO_ACCEPT_MESSAGE_DUE_TO_POLICY_REASONS_PERMANENT} Error: need MAIL command\r\n`);
              break responseGuard;
            }

            if (transactionRecipientsReceived(commandHistory) === false) {
              logger.debug(`[${uuid}]: Recipients have not been received`);
              responses.push(`${constant.STATUS_CODE.BAD_SEQUENCE_OF_COMMANDS} ${constant.ENHANCED_STATUS_CODE.MAIL_SYSTEM_UNABLE_TO_ACCEPT_MESSAGE_DUE_TO_POLICY_REASONS_PERMANENT} Error: need RCPT command\r\n`);
              break responseGuard;
            }

            if (line.data === ".") {
              logger.debug(`[${uuid}]: Received end of data transmission`);
              responses.push(`${constant.STATUS_CODE.OK} ${constant.ENHANCED_STATUS_CODE.MAIL_DELIVERED} Message accepted for delivery\r\n`);
              state.dataTransmissionInProgress = false;
              state.mailTransactionInProgress = false;
              break responseGuard;
            }

            if (state.dataTransmissionInProgress === false) {
              logger.debug(`[${uuid}]: Starting data transmission`);
              responses.push(`${constant.STATUS_CODE.START_MAIL_INPUT} Start mail input; end with <CRLF>.<CRLF>\r\n`);
              state.dataTransmissionInProgress = true;
              break responseGuard;
            }

            logger.debug(`[${uuid}]: Received data transmission part`);
            break responseGuard;
          }

          case constant.COMMAND.EHLO: {
            logger.debug(`[${uuid}]: Received EHLO command`);
            const sendingDomain = heloOrEhloCommandRegex.exec(line.data)?.[1];

            if (sendingDomain === undefined) {
              responses.push(`${constant.STATUS_CODE.SYNTAX_ERROR} Syntax: EHLO hostname\r\n`);
              break responseGuard;
            }

            logger.debug('line.data', line.data);
            logger.debug('sendingDomain', sendingDomain);

            let sendingDomainUrl: URL;
            try {
              sendingDomainUrl = new URL(`http://${sendingDomain}`);
            }
            catch (error) {
              if (error instanceof Error) logger.error('Unable to create sending domain url', { error });
              else logger.error('An unknown error occured', { error });

              responses.push(`${constant.STATUS_CODE.SYNTAX_ERROR} Syntax: EHLO hostname\r\n`);
              break responseGuard;
            }

            if (sendingDomainUrl.hostname === undefined) {
              responses.push(`${constant.STATUS_CODE.SYNTAX_ERROR} Syntax: EHLO hostname\r\n`);
              break responseGuard;
            }

            responses.push(`${constant.STATUS_CODE.OK}-${configuration.smtpServiceAgentServerHost} Hello\r\n`);
            responses.push(`${constant.STATUS_CODE.OK}-ENHANCEDSTATUSCODES\r\n`);
            responses.push(`${constant.STATUS_CODE.OK}-STARTTLS\r\n`);
            responses.push(`${constant.STATUS_CODE.OK}-SIZE ${configuration.smtpServiceAgentServerFileSize}\r\n`);
            responses.push(`${constant.STATUS_CODE.OK} HELP\r\n`);
            break responseGuard;
          }

          case constant.COMMAND.EXPN: {
            logger.debug(`[${uuid}]: Received EXPN command`);

            if (clientIntroductionOccured(commandHistory) === false) {
              responses.push(`${constant.STATUS_CODE.BAD_SEQUENCE_OF_COMMANDS} ${constant.ENHANCED_STATUS_CODE.MAIL_SYSTEM_UNABLE_TO_ACCEPT_MESSAGE_DUE_TO_POLICY_REASONS_PERMANENT} Error: send HELO first\r\n`);
              break responseGuard;
            }

            responses.push(`${constant.STATUS_CODE.VRFY_OR_EXPN_ACCEPTED} ${constant.ENHANCED_STATUS_CODE.OTHER_OR_UNDEFINED_STATUS} Cannot EXPN mailing list; but will accept a message to attempt delivery\r\n`);
            break responseGuard;
          }

          case constant.COMMAND.HELO: {
            logger.debug(`[${uuid}]: Received HELO command`);
            const sendingDomain = heloOrEhloCommandRegex.exec(line.data)?.[1];

            if (sendingDomain === undefined || sendingDomain === '') {
              responses.push(`${constant.STATUS_CODE.SYNTAX_ERROR} Syntax: HELO hostname\r\n`);
              break responseGuard;
            }

            responses.push(`${constant.STATUS_CODE.OK} ${configuration.smtpServiceAgentServerHost} Hello\r\n`);
            break responseGuard;
          }

          case constant.COMMAND.MAIL_FROM: {
            logger.debug(`[${uuid}]: Received MAIL FROM command`);

            if (clientIntroductionOccured(commandHistory) === false) {
              responses.push(`${constant.STATUS_CODE.BAD_SEQUENCE_OF_COMMANDS} ${constant.ENHANCED_STATUS_CODE.MAIL_SYSTEM_UNABLE_TO_ACCEPT_MESSAGE_DUE_TO_POLICY_REASONS_PERMANENT} Error: send HELO first\r\n`);
              break responseGuard;
            }

            if (state.mailTransactionInProgress === true) {
              responses.push(`${constant.STATUS_CODE.BAD_SEQUENCE_OF_COMMANDS} ${constant.ENHANCED_STATUS_CODE.MAIL_SYSTEM_UNABLE_TO_ACCEPT_MESSAGE_DUE_TO_POLICY_REASONS_PERMANENT} Error: nested MAIL command\r\n`);
              break responseGuard;
            }

            const match = line.data.match(mailFromCommandRegex);

            if (match === null) {
              responses.push(`${constant.STATUS_CODE.SYNTAX_ERROR} ${constant.ENHANCED_STATUS_CODE.SYNTAX_ERROR} Syntax error in parameters or arguments\r\n`);
              break responseGuard;
            }

            const sender = match[1];

            if (sender === undefined) {
              responses.push(`${constant.STATUS_CODE.SYNTAX_ERROR} ${constant.ENHANCED_STATUS_CODE.SYNTAX_ERROR} Syntax error in parameters or arguments\r\n`);
              break responseGuard;
            }

            if (sender === "") {
              responses.push(`${constant.STATUS_CODE.SYNTAX_ERROR} ${constant.ENHANCED_STATUS_CODE.SYNTAX_ERROR} Syntax error in parameters or arguments\r\n`);
              break responseGuard;
            }

            if (sender.includes("@") === false) {
              responses.push(`${constant.STATUS_CODE.SYNTAX_ERROR} ${constant.ENHANCED_STATUS_CODE.SYNTAX_ERROR} Syntax error in parameters or arguments\r\n`);
              break responseGuard;
            }

            responses.push(`${constant.STATUS_CODE.OK} ${constant.ENHANCED_STATUS_CODE.SYSTEM_STATUS} <${escape(sender)}> Sender ok\r\n`);
            state.mailTransactionInProgress = true;
            break responseGuard;
          }

          case constant.COMMAND.NOOP: {
            logger.debug(`[${uuid}]: Received NOOP command`);
            responses.push(`${constant.STATUS_CODE.OK} ${constant.ENHANCED_STATUS_CODE.SYSTEM_STATUS} Ok\r\n`);
            break responseGuard;
          }

          case constant.COMMAND.QUIT: {
            logger.debug(`[${uuid}]: Received QUIT command`);
            responses.push(`${constant.STATUS_CODE.CLOSING} ${configuration.smtpServiceAgentServerHost} closing connection\r\n`);
            break responseGuard;
          }

          case constant.COMMAND.RCPT_TO: {
            logger.debug(`[${uuid}]: Received RCPT TO command`);

            if (clientIntroductionOccured(commandHistory) === false) {
              responses.push(`${constant.STATUS_CODE.BAD_SEQUENCE_OF_COMMANDS} ${constant.ENHANCED_STATUS_CODE.MAIL_SYSTEM_UNABLE_TO_ACCEPT_MESSAGE_DUE_TO_POLICY_REASONS_PERMANENT} Error: send HELO first\r\n`)
              break responseGuard;
            }

            if (state.mailTransactionInProgress === false) {
              responses.push(`${constant.STATUS_CODE.BAD_SEQUENCE_OF_COMMANDS} ${constant.ENHANCED_STATUS_CODE.MAIL_SYSTEM_UNABLE_TO_ACCEPT_MESSAGE_DUE_TO_POLICY_REASONS_PERMANENT} Error: need MAIL command\r\n`);
              break responseGuard;
            }

            const match = line.data.match(rcptToCommandRegex);

            if (match === null) {
              responses.push(`${constant.STATUS_CODE.SYNTAX_ERROR} ${constant.ENHANCED_STATUS_CODE.SYNTAX_ERROR} Syntax error in parameters or arguments\r\n`);
              break responseGuard;
            }

            const recipient = match[1];

            if (recipient === undefined) {
              responses.push(`${constant.STATUS_CODE.SYNTAX_ERROR} ${constant.ENHANCED_STATUS_CODE.SYNTAX_ERROR} Syntax error in parameters or arguments\r\n`);
              break responseGuard;
            }

            if (recipient === "") {
              responses.push(`${constant.STATUS_CODE.SYNTAX_ERROR} ${constant.ENHANCED_STATUS_CODE.SYNTAX_ERROR} Syntax error in parameters or arguments\r\n`);
              break responseGuard;
            }

            responses.push(`${constant.STATUS_CODE.OK} 2.1.5 <${escape(recipient)}> Recipient ok\r\n`);
            break responseGuard;
          }

          case constant.COMMAND.RSET: {
            logger.debug(`[${uuid}]: Received RSET command`);

            if (clientIntroductionOccured(commandHistory) === false) {
              responses.push(`${constant.STATUS_CODE.BAD_SEQUENCE_OF_COMMANDS} ${constant.ENHANCED_STATUS_CODE.MAIL_SYSTEM_UNABLE_TO_ACCEPT_MESSAGE_DUE_TO_POLICY_REASONS_PERMANENT} Error: send HELO first\r\n`);
              break responseGuard;
            }

            responses.push(`${constant.STATUS_CODE.OK} ${constant.ENHANCED_STATUS_CODE.OTHER_OR_UNDEFINED_STATUS} Ok\r\n`);
            state.mailTransactionInProgress = false;
            break responseGuard;
          }

          case constant.COMMAND.SEND: {
            logger.debug(`[${uuid}]: Received SEND command`);

            if (clientIntroductionOccured(commandHistory) === false) {
              responses.push(`${constant.STATUS_CODE.BAD_SEQUENCE_OF_COMMANDS} ${constant.ENHANCED_STATUS_CODE.MAIL_SYSTEM_UNABLE_TO_ACCEPT_MESSAGE_DUE_TO_POLICY_REASONS_PERMANENT} Error: send HELO first\r\n`);
              break responseGuard;
            }

            responses.push(`${constant.STATUS_CODE.NOT_IMPLEMENTED} ${constant.ENHANCED_STATUS_CODE.SYNTAX_ERROR} Command not implemented\r\n`);
            break responseGuard;
          }

          case constant.COMMAND.STARTTLS: {
            logger.debug(`[${uuid}]: Received STARTTLS command`);

            if (clientIntroductionOccured(commandHistory) === false) {
              responses.push(`${constant.STATUS_CODE.BAD_SEQUENCE_OF_COMMANDS} ${constant.ENHANCED_STATUS_CODE.MAIL_SYSTEM_UNABLE_TO_ACCEPT_MESSAGE_DUE_TO_POLICY_REASONS_PERMANENT} Error: send HELO first\r\n`);
              break responseGuard;
            }

            //
            responses.push({
              message: `${constant.STATUS_CODE.START_TLS_READY} Ready to start TLS\r\n`,
              callback: () => {
                // setup TLS connection with the original socket
                const tlsOptions: TLSSocketOptions = {
                  ALPNProtocols: ['smtp'],
                  cert: secret.smtpServiceAgentServerCertificate,
                  key: secret.smtpServiceAgentServerKey,
                  isServer: true,
                  minVersion: 'TLSv1.2',
                  maxVersion: 'TLSv1.3',
                  sessionTimeout: 300
                }
                const tlsSocket = new TLSSocket(originalSocket, tlsOptions);

                tlsSocket.on('secure', () => {
                  logger.debug(`[${uuid}]: TLS connection established`);

                  // remove all listeners from the original socket and save the new socket to the active socket variable
                  originalSocket.removeAllListeners();

                  //
                  activeSocket = tlsSocket;

                  // forward events from the TLS socket to the proxy
                  tlsSocket.on('data', (chunk) => {
                    proxy.emit('data', chunk)
                  });
                });
                tlsSocket.on('close', (hadError) => {
                  logger.debug(`[${uuid}]: TLS socket closed, had error: ${hadError}`);
                });
                tlsSocket.on('error', (error) => {
                  logger.error(`[${uuid}]: TLS connection error: ${error.message}`);
                  activeSocket.end(`${constant.STATUS_CODE.CLOSING} An unrecoverable error occured\r\n`);
                });
                tlsSocket.on('end', () => {
                  logger.debug(`[${uuid}]: TLS socket ended by client`);
                  proxy.emit('end');
                });
                tlsSocket.on('timeout', () => {
                  logger.debug(`[${uuid}]: TLS socket timeout`);
                  activeSocket.end(`${constant.STATUS_CODE.CLOSING} Connection timed out\r\n`);
                });
                tlsSocket.setTimeout(Number(configuration.smtpServiceAgentServerTimeout))
              }
            });
            break;
          }

          case constant.COMMAND.VRFY: {
            logger.debug(`[${uuid}]: Received VRFY command`);

            if (clientIntroductionOccured(commandHistory) === false) {
              responses.push(`${constant.STATUS_CODE.BAD_SEQUENCE_OF_COMMANDS} ${constant.ENHANCED_STATUS_CODE.MAIL_SYSTEM_UNABLE_TO_ACCEPT_MESSAGE_DUE_TO_POLICY_REASONS_PERMANENT} Error: send HELO first\r\n`);
              break responseGuard;
            }

            responses.push(`${constant.STATUS_CODE.VRFY_OR_EXPN_ACCEPTED} ${constant.ENHANCED_STATUS_CODE.OTHER_OR_UNDEFINED_STATUS} Cannot VRFY user; but will accept message and attempt delivery\r\n`);
            break responseGuard;
          }

          case constant.COMMAND.UNKNOWN: {
            logger.debug(`[${uuid}]: Received UNKNOWN command`);

            if (clientIntroductionOccured(commandHistory) === false) {
              responses.push(`${constant.STATUS_CODE.BAD_SEQUENCE_OF_COMMANDS} ${constant.ENHANCED_STATUS_CODE.MAIL_SYSTEM_UNABLE_TO_ACCEPT_MESSAGE_DUE_TO_POLICY_REASONS_PERMANENT} Error: send HELO first\r\n`);
              break responseGuard;
            }

            if (isAscii(line.data) === false) {
              responses.push(`${constant.STATUS_CODE.COMMAND_NOT_RECOGNIZED} ${constant.ENHANCED_STATUS_CODE.SYNTAX_ERROR} Error: command not recognized\r\n`);
              break responseGuard;
            }

            responses.push(`${constant.STATUS_CODE.COMMAND_NOT_RECOGNIZED} Command not recognized\r\n`);
            break responseGuard;
          }

          default: {
            responses.push(`${constant.STATUS_CODE.COMMAND_NOT_RECOGNIZED} Command not recognized\r\n`);
            break responseGuard;
          }
        }
      }

      return {
        command,
        line,
        responses,
      }
    }),

    // Insert the line and responses into the database
    mergeMap((event) => {
      const responseSideEffects = async () => {
        let lineDocument;
        try {
          lineDocument = await db.collection('lines').insertOne({
            connectionId: connectionDocument.insertedId,
            createdAt,
            index: event.line.index,
            data: event.line.data,
          });
        }
        catch (error) {
          if (error instanceof Error) throw new InsertionError(error.message);
          else throw new InsertionError('An error occurred when inserting the line');
        }

        // If there are no responses, we can return early
        if (event.responses.length === 0) {
          return;
        }

        try {
          await db.collection('responses').insertMany(
            event.responses.map((response) => ({
              connectionId: connectionDocument.insertedId,
              createdAt,
              lineId: lineDocument.insertedId,
              data: typeof response === 'string' ? response : response.message,
            }))
          );
        }
        catch (error) {
          if (error instanceof Error) throw new InsertionError(error.message);
          else throw new InsertionError('An error occurred when inserting the response');
        }
      }

      return from(responseSideEffects()).pipe(
        map(() => event),
      )
    }),

    // Filter out events that do not have any responses
    filter(({ responses }) => responses.length > 0),
  );

  // Subscribe is run synchronously and in order. This means we can store temporary state
  // in the outer scope and use it across messages.
  message$.subscribe({
    complete: () => {
      logger.debug(`[${uuid}]: Completed message stream`);
      activeSocket.end();
    },
    error: (error) => {
      logger.error(`[${uuid}]: An error occurred`, { error: error.message });
      activeSocket.write(`${constant.STATUS_CODE.COMMAND_NOT_RECOGNIZED} An error occurred\r\n`);
      activeSocket.end();
    },
    next: ({ command, responses }) => {
      if (responses.length > 0) {
        for (const response of responses) {
          if (typeof response === 'string') activeSocket.write(response);
          else activeSocket.write(response.message, response.callback);
        }

        logger.debug(`[${uuid}]: Sent response`);
      }

      if (command === constant.COMMAND.QUIT) {
        activeSocket.end();
        logger.debug(`[${uuid}]: Closing connection`);
      }
    }
  });

  // Forward original socker events to the proxy and respond to the client
  originalSocket.on('data', (chunk: Buffer) => proxy.emit('data', chunk));
  originalSocket.on('error', (error: Error) => proxy.emit('error', error));
  originalSocket.on('close', () => proxy.emit('close'));
  originalSocket.on('end', () => proxy.emit('end'));

  //
  originalSocket.setTimeout(Number(configuration.smtpServiceAgentServerTimeout));
  originalSocket.write(`220 ${configuration.smtpServiceAgentServerHost} ESMTP ${uuid}\r\n`);
}

export default connectionHandler;
