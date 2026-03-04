import { ChildProcess } from 'child_process';
import { MongoMemoryServer } from 'mongodb-memory-server';

// Extend globalThis for test environment
declare global {
  var __MONGOINSTANCE: MongoMemoryServer;
  var __SERVER_PROCESS: ChildProcess | undefined;
  var SERVER_PORT: number;
}
