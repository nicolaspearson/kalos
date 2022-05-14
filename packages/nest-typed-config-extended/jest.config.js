const path = require('path');

const rootDir = path.resolve(__dirname);

module.exports = Object.assign({}, require(`kalos/jest.config.js`), {
  rootDir,
  roots: ['<rootDir>/src/', '<rootDir>/test/'],
});
