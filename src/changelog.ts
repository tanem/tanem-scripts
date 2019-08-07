import Octokit from '@octokit/rest';
import { compareAsc, format, isBefore } from 'date-fns';
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

const changelog = async ({
  futureRelease,
  owner,
  repo
}: {
  futureRelease?: string;
  owner?: string;
  repo?: string;
} = {}) => {
  if (!owner || !repo) {
    const repoInfo = await getRepoInfo();

    /* istanbul ignore else */
    if (!owner) {
      owner = repoInfo.owner;
    }

    /* istanbul ignore else */
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

  const [rawPulls, rawTags, rawCommits]: [
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

  const cleanedPulls = rawPulls
    .filter(pull => Boolean(pull.merged_at))
    .map(pull => ({
      mergedAt: pull.merged_at,
      number: pull.number,
      title: pull.title,
      userHtmlUrl: pull.user.html_url,
      userLogin: pull.user.login
    }));
  cleanedPulls.sort((a, b) => compareAsc(a.mergedAt, b.mergedAt));

  const pendingCleanedTags = [];

  const getCleanTagData = async (
    tag: Octokit.ReposListTagsResponseItem,
    owner: string,
    repo: string
  ): Promise<{
    date: string;
    name: string;
    pulls: typeof cleanedPulls;
  }> => {
    const existingTagCommit = rawCommits.find(
      commit => commit.sha === tag.commit.sha
    );

    if (existingTagCommit) {
      return {
        date: existingTagCommit.commit.committer.date,
        name: tag.name,
        pulls: []
      };
    }

    const { data: latestTagCommit } = await octokit.git.getCommit({
      commit_sha: tag.commit.sha, // eslint-disable-line @typescript-eslint/camelcase
      owner,
      repo
    });

    return {
      date: latestTagCommit.committer.date,
      name: tag.name,
      pulls: []
    };
  };

  for (const tag of rawTags) {
    pendingCleanedTags.push(getCleanTagData(tag, owner, repo));
  }

  const cleanedTags = await Promise.all(pendingCleanedTags);
  if (futureRelease) {
    cleanedTags.unshift({
      date: new Date().toISOString(),
      name: futureRelease,
      pulls: []
    });
  }
  cleanedTags.sort((a, b) => compareAsc(a.date, b.date));

  cleanedPulls.map(p => {
    const tag = cleanedTags.find(t => isBefore(p.mergedAt, t.date));
    /* istanbul ignore else */
    if (tag) {
      tag.pulls.unshift(p);
    }
  });

  cleanedTags.reverse();

  return (
    '# Changelog\n' +
    cleanedTags
      .map((tag, index, array) => {
        let result = `\n## [${
          tag.name
        }](https://github.com/${owner}/${repo}/tree/${tag.name}) (${format(
          tag.date,
          'YYYY-MM-DD'
        )})\n`;

        if (index + 1 !== array.length) {
          result += `[Full Changelog](https://github.com/${owner}/${repo}/compare/${array[index + 1].name}...${tag.name})\n`;
        }

        tag.pulls.map((pull, index: number) => {
          if (index === 0) {
            result += `\n**Merged pull requests:**\n\n`;
          }
          result += `- ${pull.title} [\#${pull.number}](https://github.com/${owner}/${repo}/pull/${pull.number}) ([${pull.userLogin}](${pull.userHtmlUrl}))\n`;
        });

        return result;
      })
      .join('')
  );
};

export default changelog;
