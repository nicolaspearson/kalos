module.exports = Object.assign({}, require(`kalos/packages/node-ts-uuid/jest.config.js`), {
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
  testMatch: ['**/test/**/*.spec.ts'],
});
