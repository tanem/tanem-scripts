import del from 'del';
import execa from 'execa';
import fs from 'fs';
import makeDir from 'make-dir';
import path from 'path';
import { authors } from '../src';

const commitData = new Map([
  [1, 'Andrew Powlowski <Andrew_Powlowski@yahoo.com>'],
  [4, 'Gregorio Heaney <Gregorio.Heaney43@yahoo.com>'],
  [7, 'Hallie Paucek <Hallie.Paucek@yahoo.com>'],
  [11, 'Mervin Graham <Mervin69@yahoo.com>'],
  [15, 'Miller Reichel <Miller_Reichel@yahoo.com>']
]);
const tempDir = path.join(__dirname, 'tmp-authors');

beforeAll(() => {
  makeDir.sync(tempDir);
  process.chdir(tempDir);
  execa.sync('git', ['init']);
  // eslint-disable-next-line prefer-const
  for (let [count, author] of commitData) {
    while (count--) {
      fs.writeFileSync('file.js', count);
      execa.sync('git', ['add', '--all']);
      execa.sync('git', [
        'commit',
        '-m',
        '"Message"',
        '--author',
        `"${author}"`
      ]);
    }
  }
});

afterAll(() => {
  process.chdir(__dirname);
  del.sync(tempDir, { force: true });
});

describe('async', () => {
  it('creates an author alphabetically sorted list by default', () =>
    expect(authors()).resolves.toMatchInlineSnapshot(`
    "Andrew Powlowski <Andrew_Powlowski@yahoo.com>
    Gregorio Heaney <Gregorio.Heaney43@yahoo.com>
    Hallie Paucek <Hallie.Paucek@yahoo.com>
    Mervin Graham <Mervin69@yahoo.com>
    Miller Reichel <Miller_Reichel@yahoo.com>"
  `));

  it('creates a number of commits per author sorted list when the numbered option is passed', () =>
    expect(authors({ isNumbered: true })).resolves.toMatchInlineSnapshot(`
    "Miller Reichel <Miller_Reichel@yahoo.com>
    Mervin Graham <Mervin69@yahoo.com>
    Hallie Paucek <Hallie.Paucek@yahoo.com>
    Gregorio Heaney <Gregorio.Heaney43@yahoo.com>
    Andrew Powlowski <Andrew_Powlowski@yahoo.com>"
  `));
});

describe('sync', () => {
  it('creates an author alphabetically sorted list by default', () => {
    expect(authors.sync()).toMatchInlineSnapshot(`
    "Andrew Powlowski <Andrew_Powlowski@yahoo.com>
    Gregorio Heaney <Gregorio.Heaney43@yahoo.com>
    Hallie Paucek <Hallie.Paucek@yahoo.com>
    Mervin Graham <Mervin69@yahoo.com>
    Miller Reichel <Miller_Reichel@yahoo.com>"
  `);
  });

  it('creates a number of commits per author sorted list when the numbered option is passed', () => {
    expect(authors.sync({ isNumbered: true })).toMatchInlineSnapshot(`
    "Miller Reichel <Miller_Reichel@yahoo.com>
    Mervin Graham <Mervin69@yahoo.com>
    Hallie Paucek <Hallie.Paucek@yahoo.com>
    Gregorio Heaney <Gregorio.Heaney43@yahoo.com>
    Andrew Powlowski <Andrew_Powlowski@yahoo.com>"
  `);
  });
});
