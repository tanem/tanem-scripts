import { isAfter } from 'date-fns';
import execa from 'execa';
import fs from 'fs-extra';
import path from 'path';
import semver from 'semver';
import authors from './authors';
import changelog from './changelog';
import { get as getData } from './data';

const execaOptions: execa.Options = { stdio: 'inherit' };

const release = async (): Promise<void> => {
  const { pulls, tags } = await getData();

  const latestTag = tags[tags.length - 1];

  const pullsToRelease = latestTag
    ? pulls.filter((pull) =>
        isAfter(new Date(pull.merged_at), new Date(latestTag.date))
      )
    : pulls;

  if (pullsToRelease.length === 0) {
    throw new Error('Nothing to release');
  }

  const labelsToRelease = [
    ...new Set(
      pullsToRelease.map((pull) => {
        if (pull.labels.length === 0) {
          throw new Error('Unlabelled PRs in release');
        }

        if (pull.labels.length > 1) {
          throw new Error('PRs with multiple labels in release');
        }

        return pull.labels[0].name;
      })
    ),
  ];

  const releaseType = labelsToRelease.includes('breaking')
    ? 'major'
    : labelsToRelease.includes('enhancement')
    ? 'minor'
    : 'patch';

  const packagePath = path.join(process.cwd(), 'package.json');
  const packageLockPath = path.join(process.cwd(), 'package-lock.json');

  const packageObj = await fs.readJSON(packagePath);
  const packageLockObj = await fs.readJSON(packageLockPath);

  const newVersion = semver.inc(packageObj.version, releaseType);

  await execa('npm', ['test'], execaOptions);

  const changelogContent = await changelog({
    futureRelease: `v${newVersion}`,
  });
  await fs.outputFile(
    path.join(process.cwd(), 'CHANGELOG.md'),
    changelogContent
  );

  const authorsContent = await authors();
  await fs.outputFile(path.join(process.cwd(), 'AUTHORS'), authorsContent);

  await fs.writeJSON(
    packagePath,
    { ...packageObj, version: newVersion },
    { spaces: 2 }
  );

  await fs.writeJSON(
    packageLockPath,
    { ...packageLockObj, version: newVersion },
    { spaces: 2 }
  );

  await execa('git', ['add', '.'], execaOptions);

  await execa('git', ['commit', '-m', `Release v${newVersion}`], execaOptions);

  await execa('git', ['tag', `v${newVersion}`]);

  await execa('git', ['push'], execaOptions);

  await execa('git', ['push', '--tags'], execaOptions);

  await execa('npm', ['publish', '--access', 'public'], execaOptions);
};

export default release;
