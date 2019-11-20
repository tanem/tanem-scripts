import { isAfter } from 'date-fns';
import execa from 'execa';
import { get as getData } from './data';

const release = async () => {
  const { pulls, tags } = await getData();

  const latestTag = tags.pop();

  const pullsToRelease = latestTag
    ? pulls.filter(pull =>
        isAfter(new Date(pull.merged_at), new Date(latestTag.date))
      )
    : pulls;

  const labelsToRelease = [
    ...new Set(
      pullsToRelease.map(pull => {
        if (pull.labels.length === 0) {
          throw new Error('Unlabelled PRs in release');
        }
        return pull.labels[0].name;
      })
    )
  ];

  const releaseType = labelsToRelease.includes('breaking')
    ? 'major'
    : labelsToRelease.includes('enhancement')
    ? 'minor'
    : 'patch';

  const result = execa('npm', ['version', releaseType, '-m', 'Release v%s']);

  result?.stdout?.pipe(process.stdout, { end: false });
  result?.stderr?.pipe(process.stderr, { end: false });
};

export default release;
