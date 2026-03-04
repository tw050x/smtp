import { existsSync, readFileSync } from "node:fs";
import { resolve } from 'node:path';

const smtpDatabaseNameFilePath = resolve(__dirname, '.configuration/smtp-database.name');
const smtpDatabaseUriFilePath = resolve(__dirname, '.configuration/smtp-database.uri');
const smtpServiceAdminAllowedOriginsFilePath = resolve(__dirname, '.configuration/smtp-service.admin.allowed-origins');
const smtpServiceAdminLogLevelFilePath = resolve(__dirname, '.configuration/smtp-service.admin.log.level');
const smtpServiceAdminLogPathFilePath = resolve(__dirname, '.configuration/smtp-service.admin.log.path');
const smtpServiceAdminServerHostFilePath = resolve(__dirname, '.configuration/smtp-service.admin.server.host');
const smtpServiceAdminServerPortFilePath = resolve(__dirname, '.configuration/smtp-service.admin.server.port');

if (existsSync(smtpDatabaseNameFilePath) === false) throw new Error('smtp-database.name file not found');
if (existsSync(smtpDatabaseUriFilePath) === false) throw new Error('smtp-database.uri file not found');
if (existsSync(smtpServiceAdminAllowedOriginsFilePath) === false) throw new Error('smtp-service.admin.allowed-origins file not found');
if (existsSync(smtpServiceAdminLogLevelFilePath) === false) throw new Error('smtp-service.admin.log.level file not found');
if (existsSync(smtpServiceAdminLogPathFilePath) === false) throw new Error('smtp-service.admin.log.path file not found');
if (existsSync(smtpServiceAdminServerHostFilePath) === false) throw new Error('smtp-service.admin.server.host file not found');
if (existsSync(smtpServiceAdminServerPortFilePath) === false) throw new Error('smtp-service.admin.server.port file not found');

export const smtpDatabaseName = readFileSync(smtpDatabaseNameFilePath, "utf-8").trim();
export const smtpDatabaseUri = readFileSync(smtpDatabaseUriFilePath, "utf-8").trim();
export const smtpServiceAdminAllowedOrigins = readFileSync(smtpServiceAdminAllowedOriginsFilePath, "utf-8").trim();
export const smtpServiceAdminLogLevel = readFileSync(smtpServiceAdminLogLevelFilePath, "utf-8").trim();
export const smtpServiceAdminLogPath = readFileSync(smtpServiceAdminLogPathFilePath, "utf-8").trim();
export const smtpServiceAdminServerHost = readFileSync(smtpServiceAdminServerHostFilePath, "utf-8").trim();
export const smtpServiceAdminServerPort = readFileSync(smtpServiceAdminServerPortFilePath, "utf-8").trim();

export default {
  smtpDatabaseName,
  smtpDatabaseUri,
  smtpServiceAdminAllowedOrigins,
  smtpServiceAdminLogLevel,
  smtpServiceAdminLogPath,
  smtpServiceAdminServerHost,
  smtpServiceAdminServerPort,
}
