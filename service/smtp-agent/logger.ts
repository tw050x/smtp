import { resolve } from 'node:path';
import { createLogger, format, transports } from 'winston';
import { default as configuration } from "./configuration";

const logger = createLogger({
  level: configuration.smtpServiceAgentLogLevel,
  format: format.combine(
    format.timestamp(),
    format.json()
  )
});

// Allow logging if not explicitly disabled
if (process.env.DISABLE_LOGS !== 'true') {
  logger.add(
    new transports.File({
      filename: resolve(configuration.smtpServiceAgentLogPath || 'log', 'combined.log')
    })
  )
  logger.add(
    new transports.File({
      filename: resolve(configuration.smtpServiceAgentLogPath || 'log', 'error.log'),
      level: 'error'
    })
  )
}

// Setup console logging for non production environments
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: format.simple(),
    })
  );
}


export default logger;
