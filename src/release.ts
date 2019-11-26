import { isAfter } from 'date-fns';
import execa from 'execa';
import { get as getData } from './data';
import { prompt as promptForOTP } from './otp';

const execaOptions: execa.Options = { stdio: 'ignore' };

const release = async () => {
  const otp = await promptForOTP();
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

        if (pull.labels.length > 1) {
          throw new Error('PRs with multiple labels in release');
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

  await execa(
    'npm',
    ['version', releaseType, '-m', 'Release v%s'],
    execaOptions
  );

  await execa('git', ['push'], execaOptions);
  await execa('git', ['push', '--tags'], execaOptions);
  await execa('npm', ['publish', '--otp', otp], execaOptions);
};

export default release;
