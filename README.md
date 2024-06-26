# tanem-scripts

[![npm version](https://img.shields.io/npm/v/tanem-scripts.svg?style=flat-square)](https://www.npmjs.com/package/tanem-scripts)
[![build status](https://img.shields.io/github/workflow/status/tanem/tanem-scripts/CI?style=flat-square)](https://github.com/tanem/tanem-scripts/actions?query=workflow%3ACI)
[![coverage status](https://img.shields.io/codecov/c/github/tanem/tanem-scripts.svg?style=flat-square)](https://codecov.io/gh/tanem/tanem-scripts)
[![npm downloads](https://img.shields.io/npm/dm/tanem-scripts.svg?style=flat-square)](https://www.npmjs.com/package/tanem-scripts)

> Common scripts for my projects.

## Usage

```
Usage: tanem-scripts [options] [command]

Common scripts for my projects.

Options:
  -V, --version        output the version number
  -h, --help           output usage information

Commands:
  authors              generates a list of authors in a format suitable for inclusion in an AUTHORS file
  changelog [options]  generates a changelog using GitHub tags and pull requests
  release              runs npm-version with a valid semver.inc argument
```

## API

### authors()

Returns a `Promise` that will be resolved with a list of authors sorted alphabetically by author name. If an error occurs during execution, the `Promise` is rejected with an `Error` object.

**Example**

```ts
// Note: The `fs.promises` API was added in Node.js v10.0.0.
import { promises as fs } from 'fs';
import path from 'path';
import { authors } from 'tanem-scripts';

(async () => {
  try {
    const result = await authors();
    await fs.writeFile(path.join(__dirname, 'AUTHORS'), result, 'utf-8');
  } catch (error) {
    console.error(error);
  }
})();
```

---

### changelog([options])

Returns a `Promise` that will be resolved with the changelog. If an error occurs during execution, the `Promise` is rejected with an `Error` object.

**Arguments**

- `options` - _Optional_ An object containing the optional arguments defined below. Defaults to `{}`.
  - `futureRelease` - _Optional_ Tag to use for PRs merged since the last published tag. If unspecified, those PRs will be excluded.

**Example**

```ts
// Note: The `fs.promises` API was added in Node.js v10.0.0.
import { promises as fs } from 'fs';
import path from 'path';
import { changelog } from 'tanem-scripts';

(async () => {
  try {
    const result = await changelog({
      futureRelease: 'v2.0.0',
    });
    await fs.writeFile(path.join(__dirname, 'CHANGELOG.md'), result, 'utf-8');
  } catch (error) {
    console.error(error);
  }
})();
```

---

### release()

Returns a `Promise` that will be resolved once the release script completes. If an error occurs during execution, the `Promise` is rejected with an `Error` object.

**Example**

```ts
import { release } from 'tanem-scripts';

(async () => {
  try {
    await release();
  } catch (error) {
    console.error(error);
  }
})();
```

## Installation

```
$ npm install tanem-scripts --save-dev
```

You'll also need to generate a new [GitHub personal access token](https://github.com/settings/tokens), then set an environment variable by running the following command at the prompt or by adding it to your shell profile:

```sh
export CHANGELOG_GITHUB_TOKEN=<your_github_personal_access_token>
```

## License

MIT
