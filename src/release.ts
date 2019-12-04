import { isAfter } from 'date-fns';
import execa from 'execa';
import { promises as fs } from 'fs';
import path from 'path';
import authors from './authors';
import changelog from './changelog';
import { get as getData } from './data';
import { prompt as promptForOTP } from './otp';

const execaOptions: execa.Options = { stdio: 'inherit' };

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

  await execa('npm', ['test'], execaOptions);

  const changelogContent = await changelog({
    futureRelease: `v${process.env.npm_package_version}`
  });
  await fs.writeFile(
    path.join(process.cwd(), 'CHANGELOG.md'),
    changelogContent,
    'utf-8'
  );

  const authorsContent = await authors();
  await fs.writeFile(
    path.join(process.cwd(), 'AUTHORS'),
    authorsContent,
    'utf-8'
  );

  await execa('git', ['add', '.'], execaOptions);

  await execa('git', ['push'], execaOptions);

  await execa('git', ['push', '--tags'], execaOptions);

  const otp = await promptForOTP();
  await execa(
    'npm',
    ['publish', '--access', 'public', '--otp', otp],
    execaOptions
  );
};

export default release;
