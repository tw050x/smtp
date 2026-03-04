import { MongoClient } from 'mongodb';
import { default as configuration } from './configuration';
import { default as logger } from './logger';
import { default as secrets } from './secret';

// Check if the database name is defined
if (configuration.smtpDatabaseName === undefined) {
  logger.debug(`configuration.smtpDatabaseName: ${configuration.smtpDatabaseName}`);
  throw new Error('configuration.smtpDatabaseName is not defined');
}

// Check if the database URI is defined
if (configuration.smtpDatabaseUri === undefined) {
  logger.debug(`configuration.smtpDatabaseUri: ${configuration.smtpDatabaseUri}`);
  throw new Error('configuration.smtpDatabaseUri is not defined');
}

// Create a database connection
export const mongoClient = new MongoClient(configuration.smtpDatabaseUri, {
  auth: {
    password: secrets.smtpDatabasePassword,
    username: secrets.smtpDatabaseUser,
  },
});

// Connect to the database
export const db = mongoClient.db(configuration.smtpDatabaseName);
