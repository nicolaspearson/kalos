const path = require('path');

const rootDir = path.resolve(__dirname);

module.exports = {
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: process.env.GITHUB_ACTIONS ? ['lcovonly', 'text'] : ['html', 'lcov', 'text'],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  moduleFileExtensions: ['json', 'js', 'ts'],
  rootDir,
  roots: ['<rootDir>/src/', '<rootDir>/test/'],
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.spec.ts'],
  transform: {
    '^.+\\.ts$': [require.resolve('ts-jest'), { tsconfig: '<rootDir>/tsconfig.json' }],
  },
  verbose: true,
};
