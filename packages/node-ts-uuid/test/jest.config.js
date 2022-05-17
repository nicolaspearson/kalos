module.exports = Object.assign({}, require(`kalos/packages/node-ts-uuid/jest.config.js`), {
  collectCoverageFrom: ['src/**/*.ts'],
  coverageDirectory: '<rootDir>/coverage',
  testMatch: ['**/test/**/*.spec.ts'],
});
