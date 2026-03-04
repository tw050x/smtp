import { createServer } from 'node:net';
import { default as requestHandler } from './handler.connection';
import { default as configuration } from './configuration';
import { default as logger } from './logger';

const server = createServer();

server.on('connection', requestHandler);

server.listen(configuration.smtpServiceAgentServerPort, () => {
  logger.info(`service is listening on port ${configuration.smtpServiceAgentServerPort}`);
});
