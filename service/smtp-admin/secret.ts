import { existsSync, readFileSync } from "node:fs";
import { resolve } from 'node:path';

const smtpDatabasePasswordFilePath = resolve(__dirname, '.secret/smtp-database.password');
const smtpDatabaseUserFilePath = resolve(__dirname, '.secret/smtp-database.user');

if (existsSync(smtpDatabasePasswordFilePath) === false) throw new Error('smtp-database.password file not found');
if (existsSync(smtpDatabaseUserFilePath) === false) throw new Error('smtp-database.user file not found');

export const smtpDatabasePassword = readFileSync(smtpDatabasePasswordFilePath, "utf-8").trim();
export const smtpDatabaseUser = readFileSync(smtpDatabaseUserFilePath, "utf-8").trim();

export default {
  smtpDatabasePassword,
  smtpDatabaseUser,
}
