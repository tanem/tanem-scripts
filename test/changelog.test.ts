import lolex, { InstalledClock } from 'lolex';
import { changelog } from '../src';

let clock: InstalledClock;

beforeEach(() => {
  jest.resetModules();
  clock = lolex.install({ now: new Date('2019-11-20T23:00:00.000Z') });
});

afterEach(() => {
  clock.uninstall();
});

test('handles no options passed', async () => {
  const result = await changelog();
  expect(result).toMatchSnapshot();
});

test('handles future release', async () => {
  const result = await changelog({
    futureRelease: 'v4.0.2'
  });
  expect(result).toMatchSnapshot();
});

test('handles unlabelled PRs', async () => {
  const result = await changelog({
    futureRelease: 'v4.0.2'
  });
  expect(result).toMatchSnapshot();
});

test('handles missing tag commits', async () => {
  global.polly.server
    .get('https://api.github.com/repos/tanem/tanem-scripts/commits')
    .intercept((_, res) => {
      res.status(200).json([]);
    });
  const result = await changelog({
    futureRelease: 'v4.0.2'
  });
  expect(result).toMatchSnapshot();
});
