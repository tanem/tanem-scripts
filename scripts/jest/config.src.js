module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ['src/*.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  preset: 'ts-jest',
  rootDir: process.cwd(),
  roots: ['<rootDir>/test'],
  setupFilesAfterEnv: ['<rootDir>/scripts/jest/setupJest.ts'],
  testMatch: ['<rootDir>/test/*.test.ts'],
  transform: { '^.+\\.ts$': 'ts-jest' }
};
