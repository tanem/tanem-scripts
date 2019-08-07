/* eslint-disable @typescript-eslint/camelcase */

import { subDays, subHours } from 'date-fns';
import fs from 'fs';
import lolex, { InstalledClock } from 'lolex';
import nock from 'nock';
import path from 'path';
import { changelog } from '../src';

nock.disableNetConnect();

const originalChangelogGithubToken = process.env.CHANGELOG_GITHUB_TOKEN;
const originalGitDir = process.env.GIT_DIR;
const owner = 'owner';
const repo = 'repo';
const userHtmlUrl = 'https://github.com/user';
const userLogin = 'user';
const tmpDirPath = path.join(__dirname, 'tmp-changelog');
const gitConfigPath = path.join(tmpDirPath, 'config');

let clock: InstalledClock;
let now: string;

beforeEach(() => {
  fs.mkdirSync(tmpDirPath);
  fs.writeFileSync(
    gitConfigPath,
    `[remote "origin"]\n  url = git@github.com:${owner}/${repo}.git`,
    'utf-8'
  );
  process.env.CHANGELOG_GITHUB_TOKEN = 'token';
  process.env.GIT_DIR = path.join(__dirname, 'tmp-changelog');
  clock = lolex.install({ now: new Date(2000, 1, 1) });
  now = new Date().toISOString();
});

afterEach(() => {
  fs.unlinkSync(gitConfigPath);
  fs.rmdirSync(tmpDirPath);
  process.env.CHANGELOG_GITHUB_TOKEN = originalChangelogGithubToken;
  process.env.GIT_DIR = originalGitDir;
  clock.uninstall();
});

test('handles GitHub API pagination', async () => {
  nock('https://api.github.com')
    .get('/repos/owner/repo/pulls')
    .query({ per_page: 100, state: 'closed' })
    .reply(
      200,
      [
        {
          id: 2,
          merged_at: subHours(now, 1),
          number: 2,
          title: 'Pull request 2',
          user: {
            html_url: userHtmlUrl,
            login: userLogin
          }
        }
      ],
      {
        Link:
          '<https://api.github.com/repos/owner/repo/pulls?page=2&per_page=100&state=closed>; rel="next"'
      }
    )
    .get('/repos/owner/repo/pulls')
    .query({ page: 2, per_page: 100, state: 'closed' })
    .reply(200, [
      {
        id: 1,
        merged_at: subDays(subHours(now, 1), 1),
        number: 1,
        title: 'Pull request 1',
        user: {
          html_url: userHtmlUrl,
          login: userLogin
        }
      }
    ]);

  nock('https://api.github.com')
    .get('/repos/owner/repo/tags')
    .query({ per_page: 100 })
    .reply(200, [{ name: 'v1.0.0', commit: { sha: '1' } }], {
      Link:
        '<https://api.github.com/repos/owner/repo/tags?page=2&per_page=100>; rel="next"'
    })
    .get('/repos/owner/repo/tags')
    .query({ page: 2, per_page: 100 })
    .reply(200, [{ name: 'v2.0.0', commit: { sha: '2' } }]);

  nock('https://api.github.com')
    .get('/repos/owner/repo/commits')
    .query({ per_page: 100 })
    .reply(
      200,
      [
        {
          sha: '2',
          commit: {
            committer: {
              date: now
            }
          }
        }
      ],
      {
        Link:
          '<https://api.github.com/repos/owner/repo/commits?page=2&per_page=100>; rel="next"'
      }
    )
    .get('/repos/owner/repo/commits')
    .query({ page: 2, per_page: 100 })
    .reply(200, [
      {
        sha: '1',
        commit: {
          committer: {
            date: subDays(now, 1)
          }
        }
      }
    ]);

  const result = await changelog({
    owner,
    repo
  });

  expect(result).toMatchSnapshot();
});

test('only uses merged PRs', async () => {
  nock('https://api.github.com')
    .get('/repos/owner/repo/pulls')
    .query({ per_page: 100, state: 'closed' })
    .reply(200, [
      {
        id: 2,
        merged_at: subHours(now, 2),
        number: 2,
        title: 'Pull request 2',
        user: {
          html_url: userHtmlUrl,
          login: userLogin
        }
      },
      {
        id: 1,
        merged_at: subDays(subHours(now, 2), 1),
        number: 1,
        title: 'Pull request 1',
        user: {
          html_url: userHtmlUrl,
          login: userLogin
        }
      },
      {
        id: 3,
        merged_at: null,
        number: 3,
        title: 'Pull request 3',
        user: {
          html_url: userHtmlUrl,
          login: userLogin
        }
      }
    ]);

  nock('https://api.github.com')
    .get('/repos/owner/repo/tags')
    .query({ per_page: 100 })
    .reply(200, [
      { name: 'v1.0.0', commit: { sha: '1' } },
      { name: 'v2.0.0', commit: { sha: '2' } }
    ]);

  nock('https://api.github.com')
    .get('/repos/owner/repo/commits')
    .query({ per_page: 100 })
    .reply(200, [
      {
        sha: '2',
        commit: {
          committer: {
            date: subHours(now, 1)
          }
        }
      },
      {
        sha: '1',
        commit: {
          committer: {
            date: subDays(subHours(now, 1), 1)
          }
        }
      }
    ]);

  const result = await changelog({
    owner,
    repo
  });

  expect(result).toMatchSnapshot();
});

test('refetches missing tag commits', async () => {
  nock('https://api.github.com')
    .get('/repos/owner/repo/pulls')
    .query({ per_page: 100, state: 'closed' })
    .reply(200, [
      {
        id: 1,
        merged_at: subHours(now, 1),
        number: 1,
        title: 'Pull request 1',
        user: {
          html_url: userHtmlUrl,
          login: userLogin
        }
      },
      {
        id: 2,
        merged_at: subDays(subHours(now, 1), 1),
        number: 2,
        title: 'Pull request 2',
        user: {
          html_url: userHtmlUrl,
          login: userLogin
        }
      }
    ]);

  nock('https://api.github.com')
    .get('/repos/owner/repo/tags')
    .query({ per_page: 100 })
    .reply(200, [
      { name: 'v1.0.0', commit: { sha: '1' } },
      { name: 'v2.0.0', commit: { sha: '2' } }
    ]);

  nock('https://api.github.com')
    .get('/repos/owner/repo/commits')
    .query({ per_page: 100 })
    .reply(200, [
      {
        sha: '2',
        commit: {
          committer: {
            date: now
          }
        }
      }
    ]);

  nock('https://api.github.com')
    .get('/repos/owner/repo/git/commits/1')
    .reply(200, {
      sha: '1',
      committer: {
        date: subDays(now, 1)
      }
    });

  const result = await changelog({
    owner,
    repo
  });

  expect(result).toMatchSnapshot();
});

test('can create a future release', async () => {
  nock('https://api.github.com')
    .get('/repos/owner/repo/pulls')
    .query({ per_page: 100, state: 'closed' })
    .reply(200, [
      {
        id: 2,
        merged_at: subHours(now, 1),
        number: 2,
        title: 'Pull request 2',
        user: {
          html_url: userHtmlUrl,
          login: userLogin
        }
      },
      {
        id: 1,
        merged_at: subHours(now, 3),
        number: 1,
        title: 'Pull request 1',
        user: {
          html_url: userHtmlUrl,
          login: userLogin
        }
      }
    ]);

  nock('https://api.github.com')
    .get('/repos/owner/repo/tags')
    .query({ per_page: 100 })
    .reply(200, [{ name: 'v1.0.0', commit: { sha: '1' } }]);

  nock('https://api.github.com')
    .get('/repos/owner/repo/commits')
    .query({ per_page: 100 })
    .reply(200, [
      {
        sha: '1',
        commit: {
          committer: {
            date: subHours(now, 2)
          }
        }
      }
    ]);

  const result = await changelog({
    futureRelease: 'v2.0.0',
    owner,
    repo
  });

  expect(result).toMatchSnapshot();
});

test('handles multiple PRs per tag', async () => {
  nock('https://api.github.com')
    .get('/repos/owner/repo/pulls')
    .query({ per_page: 100, state: 'closed' })
    .reply(200, [
      {
        id: 4,
        merged_at: subHours(now, 1),
        number: 4,
        title: 'Pull request 4',
        user: {
          html_url: userHtmlUrl,
          login: userLogin
        }
      },
      {
        id: 3,
        merged_at: subHours(now, 2),
        number: 3,
        title: 'Pull request 3',
        user: {
          html_url: userHtmlUrl,
          login: userLogin
        }
      },
      {
        id: 2,
        merged_at: subHours(now, 4),
        number: 2,
        title: 'Pull request 2',
        user: {
          html_url: userHtmlUrl,
          login: userLogin
        }
      },
      {
        id: 1,
        merged_at: subHours(now, 5),
        number: 1,
        title: 'Pull request 1',
        user: {
          html_url: userHtmlUrl,
          login: userLogin
        }
      }
    ]);

  nock('https://api.github.com')
    .get('/repos/owner/repo/tags')
    .query({ per_page: 100 })
    .reply(200, [{ name: 'v1.0.0', commit: { sha: '1' } }]);

  nock('https://api.github.com')
    .get('/repos/owner/repo/commits')
    .query({ per_page: 100 })
    .reply(200, [
      {
        sha: '1',
        commit: {
          committer: {
            date: subHours(now, 3)
          }
        }
      }
    ]);

  const result = await changelog({
    futureRelease: 'v2.0.0',
    owner,
    repo
  });

  expect(result).toMatchSnapshot();
});

test('can infer repo info', async () => {
  nock('https://api.github.com')
    .get('/repos/owner/repo/pulls')
    .query({ per_page: 100, state: 'closed' })
    .reply(200, [
      {
        id: 1,
        merged_at: subHours(now, 2),
        number: 1,
        title: 'Pull request 1',
        user: {
          html_url: userHtmlUrl,
          login: userLogin
        }
      }
    ]);

  nock('https://api.github.com')
    .get('/repos/owner/repo/tags')
    .query({ per_page: 100 })
    .reply(200, [{ name: 'v1.0.0', commit: { sha: '1' } }]);

  nock('https://api.github.com')
    .get('/repos/owner/repo/commits')
    .query({ per_page: 100 })
    .reply(200, [
      {
        sha: '1',
        commit: {
          committer: {
            date: subHours(now, 1)
          }
        }
      }
    ]);

  const result = await changelog();

  expect(result).toMatchSnapshot();
});

test('throws when unable to get repo info', async () => {
  fs.writeFileSync(
    gitConfigPath,
    `[remote "origin"]\n  url = invalid`,
    'utf-8'
  );

  await expect(changelog()).rejects.toThrow('Unable to parse GitHub url');
});
