/* eslint-disable @typescript-eslint/no-var-requires */

jest.mock('execa');

afterEach(() => {
  jest.resetModules();
});

test('executes when all PRs are labelled', async () => {
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

test('throws if any PRs are unlabelled', async () => {
  const { release } = require('../src');

  await expect(release()).rejects.toThrow();
});
