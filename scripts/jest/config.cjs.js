const srcConfig = require('./config.src');

module.exports = Object.assign({}, srcConfig, {
  collectCoverage: false,
  moduleNameMapper: {
    '^../src$': '<rootDir>/dist/index.js',
    '^../src/data$': '<rootDir>/dist/data.js',
    '^../src/otp$': '<rootDir>/dist/otp.js'
  }
});
