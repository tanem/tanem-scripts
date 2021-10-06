module.exports = {
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: ['src/*.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  preset: 'ts-jest/presets/js-with-ts',
  rootDir: process.cwd(),
  roots: ['<rootDir>/test'],
  setupFilesAfterEnv: ['<rootDir>/test/setupTests.ts'],
  testMatch: ['<rootDir>/test/*.test.ts'],
  testRunner: 'jest-jasmine2',
  transform: { '^.+\\.ts$': 'ts-jest' },
  transformIgnorePatterns: ['node_modules/(?!git-remote-origin-url)'],
};
