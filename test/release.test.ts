/* eslint-disable @typescript-eslint/no-var-requires */

jest.mock('execa');

afterEach(() => {
  jest.resetModules();
});

test('throws if any PRs are unlabelled', async () => {
  const { release } = require('../src');

  await expect(release()).rejects.toThrow();
});

test('runs a major release', async () => {
  const { release } = require('../src');
  const execa = jest.requireMock('execa');

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
  const { release } = require('../src');
  const execa = jest.requireMock('execa');

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
  const { release } = require('../src');
  const execa = jest.requireMock('execa');

  await release();

  expect(execa).toHaveBeenCalledTimes(1);
  expect(execa).toHaveBeenCalledWith('npm', [
    'version',
    'patch',
    '-m',
    'Release v%s'
  ]);
});
