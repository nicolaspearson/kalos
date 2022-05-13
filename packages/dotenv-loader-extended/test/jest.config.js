module.exports = Object.assign(
  {},
  require(`kalos/packages/dotenv-loader-extended/jest.config.js`),
  {
    collectCoverageFrom: ['src/**/*.ts'],
    coverageThreshold: {
      global: {
        branches: 100,
        functions: 100,
        lines: 100,
        statements: 100,
      },
    },
    coverageDirectory: '<rootDir>/coverage',
    setupFiles: ['<rootDir>/test/setup.ts'],
    testMatch: ['**/test/**/*.spec.ts'],
  },
);
