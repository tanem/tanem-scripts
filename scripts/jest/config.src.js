module.exports = {
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: ['src/*.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  preset: 'ts-jest',
  rootDir: process.cwd(),
  roots: ['<rootDir>/test'],
  setupFilesAfterEnv: ['<rootDir>/test/setupTests.ts'],
  testMatch: ['<rootDir>/test/release.test.ts'],
  transform: { '^.+\\.ts$': 'ts-jest' }
};
