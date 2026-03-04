import { resolve } from 'node:path';
import { createLogger, format, transports } from 'winston';
import { default as configuration } from './configuration';

const logger = createLogger({
  level: configuration.smtpServiceAdminLogLevel,
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.File({ filename: resolve(configuration.smtpServiceAdminLogPath || '/log', 'combined.log') }),
    new transports.File({ filename: resolve(configuration.smtpServiceAdminLogPath || '/log', 'error.log'), level: 'error' }),
  ]
});

// Setup console logging for non production environments
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: format.simple(),
    })
  );
}

export default logger;
