import { isAfter } from 'date-fns';
import execa from 'execa';
import { getData } from './data';

interface Options {
  owner?: string;
  repo?: string;
}

const release = async (options: Options = {}) => {
  const { pulls, tags } = await getData(options);

  const latestTag = tags.pop();

  const pullsToRelease = pulls.filter(pull =>
    // @ts-ignore
    isAfter(new Date(pull.merged_at), new Date(latestTag.date))
  );

  const labelsToRelease = [
    ...new Set(
      pullsToRelease
        .filter(pull => pull.labels.length)
        .map(pull => {
          const firstLabel = pull.labels.pop();
          if (firstLabel) {
            // TODO: Throw here?
            return firstLabel.name;
          }
        })
    )
  ];

  const releaseType = labelsToRelease.includes('breaking')
    ? 'major'
    : labelsToRelease.includes('enhancement')
    ? 'minor'
    : 'patch';

  const { stdout } = execa.sync('npm', ['run', 'release', releaseType]);

  return stdout;
};

export default release;
