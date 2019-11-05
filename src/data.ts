import Octokit from '@octokit/rest';
import { compareAsc } from 'date-fns';
import gitRemoteOriginUrl from 'git-remote-origin-url';
import parseGithubUrl from 'parse-github-url';

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

export const getData = async ({
  owner,
  repo
}: {
  owner?: string;
  repo?: string;
} = {}) => {
  if (!owner || !repo) {
    const repoInfo = await getRepoInfo();

    if (!owner) {
      owner = repoInfo.owner;
    }

    if (!repo) {
      repo = repoInfo.repo;
    }
  }

  const octokit = new Octokit({
    auth: process.env.CHANGELOG_GITHUB_TOKEN
  });

  const baseEndpointOptions = {
    owner,
    per_page: 100, // eslint-disable-line @typescript-eslint/camelcase
    repo
  };

  const [pulls, rawTags, commits]: [
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
        owner: owner as string,
        repo: repo as string
      });

      return {
        date: tagCommit.committer.date,
        name: tag.name
      };
    })
  );

  tags.sort((a, b) => compareAsc(new Date(a.date), new Date(b.date)));

  return {
    pulls,
    tags
  };
};
