import { isAfter } from 'date-fns';
import execa from 'execa';
import prompt from 'prompt-promise';
import { get as getData } from './data';

const execaOptions: execa.Options = { stdio: 'ignore' };

// Hat-tip: https://github.com/facebook/react/blob/master/scripts/release/publish-commands/prompt-for-otp.js.
// TODO (Tane): This'll be nice to do at some point: https://github.com/facebook/react/blob/master/scripts/release/theme.js.
const promptForOTP = async () => {
  while (true) {
    const otp = await prompt('NPM 2-factor auth code: ');
    prompt.done();

    if (otp) {
      return otp;
    } else {
      console.log('Two-factor auth is required to publish.');
    }
  }
};

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
