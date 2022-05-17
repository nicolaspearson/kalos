module.exports = Object.assign(
  {},
  require(`kalos/packages/nest-typed-config-extended/jest.config.js`),
  {
    collectCoverageFrom: ['src/**/*.ts'],
    coverageDirectory: '<rootDir>/coverage',
    setupFiles: ['<rootDir>/test/setup.ts'],
    testMatch: ['**/test/**/*.spec.ts'],
  },
);
