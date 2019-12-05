/* eslint-disable @typescript-eslint/camelcase */

jest.mock('execa');
jest.mock('fs', () => ({
  promises: {
    writeFile: jest.fn()
  }
}));
jest.mock('../src/changelog');
jest.mock('../src/authors');
jest.mock('../src/otp', () => ({
  prompt: async () => '123'
}));

import execa from 'execa';
import { release } from '../src';
import changelog from '../src/changelog';

const originalNpmPackageVersion = process.env.npm_package_version;

afterEach(() => {
  process.env.npm_package_version = originalNpmPackageVersion;
});

test('throws if any PRs are unlabelled', async () => {
  await expect(release()).rejects.toThrow();
});

test('throws if any PRs have multiple labels', async () => {
  await expect(release()).rejects.toThrow();
});

test.skip('handles no tags', async () => {
  global.polly.server
    .get('https://api.github.com/repos/tanem/tanem-scripts/tags')
    .intercept((_, res) => {
      res.status(200).json([]);
    });

  // Mimic the major version bump from `npm version major`.
  process.env.npm_package_version = '5.0.0';

  await release();

  expect(execa).toHaveBeenNthCalledWith(
    1,
    'npm',
    ['version', 'major', '-m', 'Release v%s'],
    { stdio: 'inherit' }
  );
  expect(changelog).toHaveBeenCalledTimes(1);
  expect(changelog).toHaveBeenCalledWith({
    futureRelease: `v${process.env.npm_package_version}`
  });
  expect(execa).toHaveBeenCalledWith(
    'npm',
    ['publish', '--access', 'public', '--otp', '123'],
    {
      stdio: 'inherit'
    }
  );
});

test.skip('runs a major release', async () => {
  // Mimic the major version bump from `npm version major`.
  process.env.npm_package_version = '5.0.0';

  await release();

  expect(execa).toHaveBeenNthCalledWith(
    1,
    'npm',
    ['version', 'major', '-m', 'Release v%s'],
    { stdio: 'inherit' }
  );
  expect(changelog).toHaveBeenCalledTimes(1);
  expect(changelog).toHaveBeenCalledWith({
    futureRelease: `v${process.env.npm_package_version}`
  });
  expect(execa).toHaveBeenCalledWith(
    'npm',
    ['publish', '--access', 'public', '--otp', '123'],
    {
      stdio: 'inherit'
    }
  );
});

test.skip('runs a minor release', async () => {
  // Mimic the minor version bump from `npm version minor`.
  process.env.npm_package_version = '4.1.0';

  await release();

  expect(execa).toHaveBeenNthCalledWith(
    1,
    'npm',
    ['version', 'minor', '-m', 'Release v%s'],
    { stdio: 'inherit' }
  );
  expect(changelog).toHaveBeenCalledTimes(1);
  expect(changelog).toHaveBeenCalledWith({
    futureRelease: `v${process.env.npm_package_version}`
  });
  expect(execa).toHaveBeenCalledWith(
    'npm',
    ['publish', '--access', 'public', '--otp', '123'],
    {
      stdio: 'inherit'
    }
  );
});

test.skip('runs a patch release', async () => {
  // Mimic the patch version bump from `npm version patch`.
  process.env.npm_package_version = '4.0.7';

  await release();

  expect(execa).toHaveBeenNthCalledWith(
    1,
    'npm',
    ['version', 'patch', '-m', 'Release v%s'],
    { stdio: 'inherit' }
  );
  expect(changelog).toHaveBeenCalledTimes(1);
  expect(changelog).toHaveBeenCalledWith({
    futureRelease: `v${process.env.npm_package_version}`
  });
  expect(execa).toHaveBeenCalledWith(
    'npm',
    ['publish', '--access', 'public', '--otp', '123'],
    {
      stdio: 'inherit'
    }
  );
});
