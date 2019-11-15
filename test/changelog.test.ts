/* eslint-disable @typescript-eslint/no-var-requires */

import lolex, { InstalledClock } from 'lolex';

let clock: InstalledClock;

beforeEach(() => {
  jest.resetModules();
  clock = lolex.install({ now: new Date('2019-11-08T23:00:00.000Z') });
});

afterEach(() => {
  clock.uninstall();
});

test('handles no options passed', async () => {
  const { changelog } = require('../src');
  const result = await changelog();
  expect(result).toMatchSnapshot();
});

test('handles future release', async () => {
  const { changelog } = require('../src');
  const result = await changelog({
    futureRelease: 'v3.1.3'
  });
  expect(result).toMatchSnapshot();
});
