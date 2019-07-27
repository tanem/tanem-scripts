import execa from 'execa';
import globCore from 'glob';
import path from 'path';
import { promisify } from 'util';

const glob = promisify(globCore);

export const audit = async () => {
  const paths = await glob('**/package.json', {
    ignore: '**/node_modules/**',
    absolute: true
  });
  for (const dir of paths.map(path.dirname)) {
    console.log(`${dir}/package.json`);
    process.chdir(dir);
    await execa('npm', ['audit', 'fix', '-s'], { stdio: 'inherit' });
  }
};
