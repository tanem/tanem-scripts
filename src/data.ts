import Octokit from '@octokit/rest';
import { compareAsc } from 'date-fns';
import gitRemoteOriginUrl from 'git-remote-origin-url';
import parseGithubUrl from 'parse-github-url';

export interface Data {
  commits: Octokit.ReposListCommitsResponseItem[];
  owner: string;
  pulls: Octokit.PullsListResponseItem[];
  repo: string;
  tags: {
    date: string;
    name: string;
  }[];
}

const getRepoInfo = async () => {
  const url = await gitRemoteOriginUrl();
  const parsed = parseGithubUrl(url);

  /* istanbul ignore else */
  if (parsed && parsed.owner && parsed.name) {
    return {
      owner: parsed.owner,
      repo: parsed.name
    };
  }

  throw new Error('Unable to parse GitHub url');
};

export const cache = new Map<'data', Data>();

export const get = async (): Promise<Data> => {
  let data = cache.get('data');

  if (data) {
    return data;
  }

  const { owner, repo } = await getRepoInfo();

  const octokit = new Octokit({
    auth: process.env.CHANGELOG_GITHUB_TOKEN
  });

  const baseEndpointOptions = {
    owner,
    per_page: 100, // eslint-disable-line @typescript-eslint/camelcase
    repo
  };

  const [rawPulls, rawTags, commits]: [
    Octokit.PullsListResponseItem[],
    Octokit.ReposListTagsResponseItem[],
    Octokit.ReposListCommitsResponseItem[]
  ] = await Promise.all([
    octokit.paginate(
      octokit.pulls.list.endpoint.merge({
        ...baseEndpointOptions,
        state: 'closed'
      })
    ),
    octokit.paginate(
      octokit.repos.listTags.endpoint.merge(baseEndpointOptions)
    ),
    octokit.paginate(
      octokit.repos.listCommits.endpoint.merge(baseEndpointOptions)
    )
  ]);

  const pulls = rawPulls.filter(pull => Boolean(pull.merged_at));

  pulls.sort((a, b) =>
    compareAsc(new Date(a.merged_at), new Date(b.merged_at))
  );

  const tags = await Promise.all(
    rawTags.map(async tag => {
      const commit = commits.find(commit => commit.sha === tag.commit.sha);

      if (commit) {
        return {
          date: commit.commit.committer.date,
          name: tag.name
        };
      }

      const { data: tagCommit } = await octokit.git.getCommit({
        commit_sha: tag.commit.sha, // eslint-disable-line @typescript-eslint/camelcase
        owner,
        repo
      });

      return {
        date: tagCommit.committer.date,
        name: tag.name
      };
    })
  );

  tags.sort((a, b) => compareAsc(new Date(a.date), new Date(b.date)));

  data = {
    commits,
    owner,
    pulls,
    repo,
    tags
  };

  cache.set('data', data);

  return data;
};
