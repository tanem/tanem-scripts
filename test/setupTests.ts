import { cache } from '../src/data';

beforeEach(() => {
  jest.resetModules();
});

afterEach(() => {
  cache.clear();
  jest.restoreAllMocks();
});
