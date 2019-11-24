import { cache, get as getData } from '../src/data';

beforeEach(() => {
  jest.resetModules();
});

test(`throws if can't parse GitHub url`, async () => {
  jest.doMock('parse-github-url', () => ({
    __esModule: true,
    default: () => null
  }));
  const { get: getData } = await import('../src/data');

  await expect(getData()).rejects.toThrow();
});

test('handles missing tag commits', async () => {
  global.polly.server
    .get('https://api.github.com/repos/tanem/tanem-scripts/commits')
    .intercept((_, res) => {
      res.status(200).json([]);
    });

  const result = await getData();

  expect(result).toMatchSnapshot();
});

test('uses cache', async () => {
  const spy = jest.spyOn(cache, 'get');

  let result = await getData();
  expect(result).toMatchSnapshot();
  expect(spy).toHaveBeenCalledTimes(0);

  result = await getData();
  expect(result).toMatchSnapshot();
  expect(spy).toHaveBeenCalledTimes(1);
  expect(spy).toHaveBeenCalledWith('data');
});
