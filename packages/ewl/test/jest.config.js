module.exports = Object.assign({}, require(`kalos/packages/ewl/jest.config.js`), {
  collectCoverageFrom: ['src/**/*.ts', '!src/config/request-logging.config.ts'],
  coverageDirectory: '<rootDir>/coverage',
  testMatch: ['**/test/**/*.spec.ts'],
});
