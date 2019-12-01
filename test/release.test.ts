jest.mock('execa');
jest.mock('../src/otp', () => ({
  prompt: async () => '123'
}));

import execa from 'execa';
import { release } from '../src';

test('throws if any PRs are unlabelled', async () => {
  await expect(release()).rejects.toThrow();
});

test('throws if any PRs have multiple labels', async () => {
  await expect(release()).rejects.toThrow();
});

test('handles no tags', async () => {
  global.polly.server
    .get('https://api.github.com/repos/tanem/tanem-scripts/tags')
    .intercept((_, res) => {
      res.status(200).json([]);
    });

  await release();

  expect(execa).toHaveBeenCalledTimes(4);
  expect(execa).toHaveBeenNthCalledWith(
    1,
    'npm',
    ['version', 'major', '-m', 'Release v%s'],
    { stdio: 'inherit' }
  );
  expect(execa).toHaveBeenNthCalledWith(2, 'git', ['push'], {
    stdio: 'inherit'
  });
  expect(execa).toHaveBeenNthCalledWith(3, 'git', ['push', '--tags'], {
    stdio: 'inherit'
  });
  expect(execa).toHaveBeenNthCalledWith(
    4,
    'npm',
    ['publish', '--access', 'public', '--otp', '123'],
    {
      stdio: 'inherit'
    }
  );
});

test('runs a major release', async () => {
  await release();

  expect(execa).toHaveBeenCalledTimes(4);
  expect(execa).toHaveBeenNthCalledWith(
    1,
    'npm',
    ['version', 'major', '-m', 'Release v%s'],
    { stdio: 'inherit' }
  );
  expect(execa).toHaveBeenNthCalledWith(2, 'git', ['push'], {
    stdio: 'inherit'
  });
  expect(execa).toHaveBeenNthCalledWith(3, 'git', ['push', '--tags'], {
    stdio: 'inherit'
  });
  expect(execa).toHaveBeenNthCalledWith(
    4,
    'npm',
    ['publish', '--access', 'public', '--otp', '123'],
    {
      stdio: 'inherit'
    }
  );
});

test('runs a minor release', async () => {
  await release();

  expect(execa).toHaveBeenCalledTimes(4);
  expect(execa).toHaveBeenNthCalledWith(
    1,
    'npm',
    ['version', 'minor', '-m', 'Release v%s'],
    { stdio: 'inherit' }
  );
  expect(execa).toHaveBeenNthCalledWith(2, 'git', ['push'], {
    stdio: 'inherit'
  });
  expect(execa).toHaveBeenNthCalledWith(3, 'git', ['push', '--tags'], {
    stdio: 'inherit'
  });
  expect(execa).toHaveBeenNthCalledWith(
    4,
    'npm',
    ['publish', '--access', 'public', '--otp', '123'],
    {
      stdio: 'inherit'
    }
  );
});

test('runs a patch release', async () => {
  await release();

  expect(execa).toHaveBeenCalledTimes(4);
  expect(execa).toHaveBeenNthCalledWith(
    1,
    'npm',
    ['version', 'patch', '-m', 'Release v%s'],
    { stdio: 'inherit' }
  );
  expect(execa).toHaveBeenNthCalledWith(2, 'git', ['push'], {
    stdio: 'inherit'
  });
  expect(execa).toHaveBeenNthCalledWith(3, 'git', ['push', '--tags'], {
    stdio: 'inherit'
  });
  expect(execa).toHaveBeenNthCalledWith(
    4,
    'npm',
    ['publish', '--access', 'public', '--otp', '123'],
    {
      stdio: 'inherit'
    }
  );
});
