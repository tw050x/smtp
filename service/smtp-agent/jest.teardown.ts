// third-party packages
import { MongoMemoryServer } from 'mongodb-memory-server';

/**
 * Tears down up the global environment for tests
 *
 */
export default async function globalTeardown() {

  // teardown MongoDB
  const instance: MongoMemoryServer = global.__MONGOINSTANCE;
  await instance.stop();

  // teardown SMTP server
  global.__SERVER_PROCESS?.stdout?.removeAllListeners();
  global.__SERVER_PROCESS?.stderr?.removeAllListeners();
  global.__SERVER_PROCESS?.kill('SIGTERM');

  // wait for teardown to complete
  await new Promise<void>((resolve) => {
    global.__SERVER_PROCESS?.once('exit', resolve);
  });
}
