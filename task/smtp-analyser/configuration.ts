import { existsSync, readFileSync } from "node:fs";
import { resolve } from 'node:path';

const smtpDatabaseNameFilePath = resolve(__dirname, '.configuration/smtp-database.name');
const smtpDatabaseUriFilePath = resolve(__dirname, '.configuration/smtp-database.uri');
const smtpServiceAnalyserLogLevelFilePath = resolve(__dirname, '.configuration/smtp-service.analyser.log.level');
const smtpServiceAnalyserLogPathFilePath = resolve(__dirname, '.configuration/smtp-service.analyser.log.path');

if (existsSync(smtpDatabaseNameFilePath) === false) throw new Error('smtp-database.name file not found');
if (existsSync(smtpDatabaseUriFilePath) === false) throw new Error('smtp-database.uri file not found');
if (existsSync(smtpServiceAnalyserLogLevelFilePath) === false) throw new Error('smtp-service.analyser.log.level file not found');
if (existsSync(smtpServiceAnalyserLogPathFilePath) === false) throw new Error('smtp-service.analyser.log.path file not found');

export const smtpDatabaseName = readFileSync(smtpDatabaseNameFilePath, "utf-8").trim();
export const smtpDatabaseUri = readFileSync(smtpDatabaseUriFilePath, "utf-8").trim();
export const smtpServiceAnalyserLogLevel = readFileSync(smtpServiceAnalyserLogLevelFilePath, "utf-8").trim();
export const smtpServiceAnalyserLogPath = readFileSync(smtpServiceAnalyserLogPathFilePath, "utf-8").trim();

export default {
  smtpDatabaseName,
  smtpDatabaseUri,
  smtpServiceAnalyserLogLevel,
  smtpServiceAnalyserLogPath,
}
