module.exports = Object.assign({}, require(`kalos/packages/ewl/jest.config.js`), {
  collectCoverageFrom: ['src/**/*.ts'],
  coverageDirectory: '<rootDir>/coverage',
  testMatch: ['**/test/**/*.spec.ts'],
});
