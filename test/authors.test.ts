import { authors } from '../src';

test('creates authors string', async () => {
  const result = await authors();
  expect(result).toMatchInlineSnapshot(`
    "Renovate Bot <bot@renovateapp.com>
    Tane Morgan <464864+tanem@users.noreply.github.com>
    dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>"
  `);
});
