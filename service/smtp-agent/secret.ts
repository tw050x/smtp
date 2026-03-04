import { existsSync, readFileSync } from "node:fs";
import { resolve } from 'node:path';

const smtpDatabasePasswordFilePath = resolve(__dirname, '.secret/smtp-database.password');
const smtpDatabaseUserFilePath = resolve(__dirname, '.secret/smtp-database.user');
const smtpServiceAgentServerCertificateFilePath = resolve(__dirname, '.secret/smtp-service.agent.server.certificate');
const smtpServiceAgentServerKeyFilePath = resolve(__dirname, '.secret/smtp-service.agent.server.key');

if (existsSync(smtpDatabasePasswordFilePath) === false) throw new Error('smtp-database.password file not found');
if (existsSync(smtpDatabaseUserFilePath) === false) throw new Error('smtp-database.user file not found');
if (existsSync(smtpServiceAgentServerCertificateFilePath) === false) throw new Error('smtp-service.agent.server.certificate file not found');
if (existsSync(smtpServiceAgentServerKeyFilePath) === false) throw new Error('smtp-service.agent.server.key file not found');

export const smtpDatabasePassword = readFileSync(smtpDatabasePasswordFilePath, "utf-8").trim();
export const smtpDatabaseUser = readFileSync(smtpDatabaseUserFilePath, "utf-8").trim();
export const smtpServiceAgentServerCertificate = readFileSync(smtpServiceAgentServerCertificateFilePath, 'utf-8').trim();
export const smtpServiceAgentServerKey = readFileSync(smtpServiceAgentServerKeyFilePath, 'utf-8').trim();

export default {
  smtpDatabasePassword,
  smtpDatabaseUser,
  smtpServiceAgentServerCertificate,
  smtpServiceAgentServerKey,
}
