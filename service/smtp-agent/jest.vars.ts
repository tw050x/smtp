import { existsSync, readFileSync } from "node:fs";
import { resolve } from 'node:path';

const smtpDatabaseNameFilePath = resolve(__dirname, '.configuration/smtp-database.name');
const smtpDatabaseUriFilePath = resolve(__dirname, '.configuration/smtp-database.uri');
const smtpServiceAgentServerHostFilePath = resolve(__dirname, '.configuration/smtp-service.agent.server.host');
const smtpServiceAgentServerPortFilePath = resolve(__dirname, '.configuration/smtp-service.agent.server.port');
const smtpServiceAgentServerTimeoutFilePath = resolve(__dirname, '.configuration/smtp-service.agent.server.timeout');

if (existsSync(smtpDatabaseNameFilePath) === false) throw new Error('smtp-database.name file not found');
if (existsSync(smtpDatabaseUriFilePath) === false) throw new Error('smtp-database.uri file not found');
if (existsSync(smtpServiceAgentServerHostFilePath) === false) throw new Error('smtp-service.agent.server.host file not found');
if (existsSync(smtpServiceAgentServerPortFilePath) === false) throw new Error('smtp-service.agent.server.port file not found');
if (existsSync(smtpServiceAgentServerTimeoutFilePath) === false) throw new Error('smtp-service.agent.server.timeout file not found');

export const smtpDatabaseName = readFileSync(smtpDatabaseNameFilePath, "utf-8").trim();
export const smtpDatabaseUri = readFileSync(smtpDatabaseUriFilePath, "utf-8").trim();
export const smtpServiceAgentServerHost = readFileSync(smtpServiceAgentServerHostFilePath, "utf-8").trim();
export const smtpServiceAgentServerPort = readFileSync(smtpServiceAgentServerPortFilePath, "utf-8").trim();
export const smtpServiceAgentServerTimeout = readFileSync(smtpServiceAgentServerTimeoutFilePath, "utf-8").trim();
