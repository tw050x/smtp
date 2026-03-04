import type { JestConfigWithTsJest } from 'ts-jest';

const jestJUnitReporterOptions = {
  classNameTemplate: '{classname}',
  outputDirectory: '../../coverage/service/smtp-agent',
  outputName: 'junit.xml',
  suiteName: 'Server',
  titleTemplate: '{title}',
};

const config: JestConfigWithTsJest = {
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: 'coverage/',
  coverageReporters: ['clover', 'json', 'lcov', 'text', 'text-summary'],
  displayName: 'smtp-agent',
  globalSetup: '<rootDir>/jest.setup.ts',
  globalTeardown: '<rootDir>/jest.teardown.ts',
  moduleFileExtensions: [
    'ts',
    'js',
  ],
  reporters: ['default', ['jest-junit', jestJUnitReporterOptions]],
  rootDir: './',
  testEnvironment: 'node',
  testPathIgnorePatterns: [
    '/node_modules/',
  ],
  testMatch: [
    '**/specification/**/*.spec.ts',
  ],
  transform: {
    '\\.(ts|tsx)$': [
      'ts-jest',
      { tsconfig: '<rootDir>/tsconfig.spec.json' },
    ],
  },
  verbose: true,
}

export default config;
