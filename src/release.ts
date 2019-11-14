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

  const result = execa('npm', ['version', releaseType, '-m', 'Release v%s']);

  result.stdout &&
    result.stdout.pipe(
      process.stdout,
      { end: false }
    );

  result.stderr &&
    result.stderr.pipe(
      process.stderr,
      { end: false }
    );
};

export default release;
