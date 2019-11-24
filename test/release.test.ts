jest.mock('execa');

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

  expect(execa).toHaveBeenCalledTimes(1);
  expect(execa).toHaveBeenCalledWith('npm', [
    'version',
    'major',
    '-m',
    'Release v%s'
  ]);
});

test('runs a major release', async () => {
  await release();

  expect(execa).toHaveBeenCalledTimes(1);
  expect(execa).toHaveBeenCalledWith('npm', [
    'version',
    'major',
    '-m',
    'Release v%s'
  ]);
});

test('runs a minor release', async () => {
  await release();

  expect(execa).toHaveBeenCalledTimes(1);
  expect(execa).toHaveBeenCalledWith('npm', [
    'version',
    'minor',
    '-m',
    'Release v%s'
  ]);
});

test('runs a patch release', async () => {
  await release();

  expect(execa).toHaveBeenCalledTimes(1);
  expect(execa).toHaveBeenCalledWith('npm', [
    'version',
    'patch',
    '-m',
    'Release v%s'
  ]);
});
