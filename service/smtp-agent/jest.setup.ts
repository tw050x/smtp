// node internals
import { ChildProcess, spawn } from 'node:child_process';
import { resolve } from 'node:path';

// third-party packages
import { MongoMemoryServer } from 'mongodb-memory-server';

import * as vars from './jest.vars';

let serverProcess: ChildProcess | undefined;

/**
 * Sets up the global environment for tests
 *
 * DEVERLOPER NOTE:
 * This function does 2 things:
 *
 * **1st**
 * It sets up a single MongoDB instance for all tests to use. This way each test can either
 * seed the database before running tests or check the database after running tests.
 *
 * **2nd**
 * The SMTP server is spawned as a child process. This way the SMTP server can be tested
 * in isolation from the rest of the application.
 *
 * @see https://jestjs.io/docs/configuration#globalsetup-string
 */
export default async function globalSetup(): Promise<void> {

  // setup MongoDB
  const instance = await MongoMemoryServer.create({
    instance: {
      ip: '127.0.0.1',
      port: 27017,
    },
    auth: {
      customRootName: 'user',
      customRootPwd: 'password',
      enable: true,
    }
  });
  global.__MONGOINSTANCE = instance;

  const env = Object.assign({}, process.env, {
    DISABLE_LOGS: 'true',
    DISABLE_CERTIFICATES: 'true',
  })
  global.__SERVER_PROCESS = serverProcess = spawn('tsx', ['serve.ts'], {
    cwd: resolve(__dirname),
    env,
  });

  await new Promise<void>((resolve, reject) => {
    if (serverProcess === undefined) {
      reject('serverProcess.stdout is null');
      return
    }

    if (serverProcess.stdout === null) {
      reject('serverProcess.stdout is null');
      return
    }

    if (serverProcess.stderr === null) {
      reject('serverProcess.stderr is null');
      return
    }

    serverProcess.stdout.on('data', (data) => {
      const message = data.toString();
      console.log(message);
      if (message.includes(`service is listening on port ${vars.smtpServiceAgentServerPort}`)) {
        resolve();
      }
    });

    serverProcess.stderr.on('data', (data) => {
      reject(data.toString());
    });
  });
}
