import * as constant from './constant';
import { CommandHistory } from './types';

/**
 * Returns true if the client has introduced themselves already.
 *
 * @param commandHistory
 * @returns boolean
 */
export const clientIntroductionOccured = (commandHistory: CommandHistory) => {
  return commandHistory.includes(constant.COMMAND.EHLO) || commandHistory.includes(constant.COMMAND.HELO);
};

/**
 * Returns true if the server has received recipients in the current transaction.
 *
 * **1st Guard:**
 * If the MAIL FROM command is not present in the command history then there is
 * no transaction in progress. This is becuase the client has not yet sent a MAIL
 * FROM from command.
 *
 * **2nd Guard:**
 * If the RCPT TO command is not present in the command history then there are no
 * recipients in the transaction. This is because the client has not yet sent a
 * RCPT TO command.
 *
 * **3rd Guard:**
 * If the latest RCPT TO command is before the latest MAIL FROM command then there
 * are no recipients in the transaction. This is because the client has not yet
 * sent a MAIL FROM command.
 *
 * Developer Note:
 * We do not need to check to see if the latest RCPT TO command is before a RSET
 * command or a DATA command because the transactionInProgress guard will catch
 * the scenarios where the client has reset the transaction or has already sent
 * the DATA command.
 *
 * @param commandHistory
 * @returns boolean
 */
export const transactionRecipientsReceived = (commandHistory: CommandHistory) => {
  const latestMailFromCommandIndex = commandHistory.indexOf(constant.COMMAND.MAIL_FROM);
  const latestRcptToCommandIndex = commandHistory.indexOf(constant.COMMAND.RCPT_TO);

  recipientReceivedGuard: {
    if (latestMailFromCommandIndex === -1) {
      break recipientReceivedGuard;
    }

    if (latestRcptToCommandIndex === -1) {
      break recipientReceivedGuard;
    }

    if (latestRcptToCommandIndex < latestMailFromCommandIndex) {
      break recipientReceivedGuard;
    }

    return true;
  }

  return false;
};
