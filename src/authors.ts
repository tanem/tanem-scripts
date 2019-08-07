import execa from 'execa';

interface Options {
  isNumbered?: boolean;
}

const clean = (result: string) =>
  result
    .split('\n')
    .map(line => line.replace(/ *\d+\t/g, ''))
    .join('\n');

const authors = async ({ isNumbered }: Options = {}) => {
  const { stdout } = await execa('git', [
    'shortlog',
    'HEAD',
    `-se${isNumbered ? 'n' : ''}`
  ]);
  return clean(stdout);
};

authors.sync = ({ isNumbered }: Options = {}) => {
  const { stdout } = execa.sync('git', [
    'shortlog',
    'HEAD',
    `-se${isNumbered ? 'n' : ''}`
  ]);
  return clean(stdout);
};

export default authors;
