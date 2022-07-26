module.exports = Object.assign({}, require(`kalos/packages/grpc-boom/jest.config.js`), {
  collectCoverageFrom: ['src/**/*.ts'],
  coverageThreshold: {
    global: {
      branches: 92.1,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  coverageDirectory: '<rootDir>/coverage',
  testMatch: ['**/test/**/*.spec.ts'],
});
