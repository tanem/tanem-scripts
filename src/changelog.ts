import { isBefore } from 'date-fns';
import { get as getData } from './data';

interface Options {
  futureRelease?: string;
}

const UNLABELLED = 'unlabelled';

const labelHeadings: { [label: string]: string } = {
  breaking: ':boom: Breaking Change',
  bug: ':bug: Bug Fix',
  documentation: ':memo: Documentation',
  enhancement: ':rocket: Enhancement',
  internal: ':house: Internal',
  unlabelled: ':question: Unlabelled'
};

const changelog = async ({ futureRelease }: Options = {}) => {
  const { owner, pulls: rawPulls, repo, tags: rawTags } = await getData();

  const cleanedPulls = rawPulls.map(pull => ({
    label: pull.labels.length ? pull.labels[0].name : UNLABELLED,
    mergedAt: pull.merged_at,
    number: pull.number,
    title: pull.title,
    userHtmlUrl: pull.user.html_url,
    userLogin: pull.user.login
  }));

  const cleanedTags = rawTags.map(tag => ({
    ...tag,
    pulls: {} as { [key: string]: typeof cleanedPulls }
  }));

  if (futureRelease) {
    cleanedTags.push({
      date: new Date().toISOString(),
      name: futureRelease,
      pulls: {}
    });
  }

  cleanedPulls.map(p => {
    const tag = cleanedTags.find(t =>
      isBefore(new Date(p.mergedAt), new Date(t.date))
    );
    /* istanbul ignore else */
    if (tag) {
      tag.pulls[p.label] = [p, ...(tag.pulls[p.label] || [])];
    }
  });

  cleanedTags.reverse();

  return (
    '# Changelog\n' +
    cleanedTags
      .map((tag, index, array) => {
        let result = `\n## [${
          tag.name
        }](https://github.com/${owner}/${repo}/tree/${
          tag.name
        }) (${tag.date.slice(0, tag.date.indexOf('T'))})\n`;

        if (index + 1 !== array.length) {
          result += `[Full Changelog](https://github.com/${owner}/${repo}/compare/${array[index + 1].name}...${tag.name})\n`;
        }

        result += Object.keys(tag.pulls)
          .sort()
          .reduce(
            (result, label) =>
              (result += tag.pulls[label].reduce(
                (result, pull) =>
                  (result += `- [\#${pull.number}](https://github.com/${owner}/${repo}/pull/${pull.number}) ${pull.title} ([@${pull.userLogin}](${pull.userHtmlUrl}))\n`),
                `\n#### ${labelHeadings[label]}\n\n`
              )),
            ''
          );

        return result;
      })
      .join('')
  );
};

export default changelog;
