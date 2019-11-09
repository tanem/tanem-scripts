import execa from 'execa';
import { get as getData } from './data';


// Note: This can only be run from the repo you are in... is this an assumption
// we want to make for every script?
const authors = async () => {
  const { commits } = await getData();

  const authors = commits
    .map(commit => {
      let author = `${commit.commit.author.name} <${commit.commit.author.email}>`;
      ({ stdout: author } = execa.sync('git', ['check-mailmap', author]));
      return author;
    })
    .reduce(
      (result, author) =>
        result.includes(author) ? result : [...result, author],
      [] as string[]
    );

  authors.sort();

  return authors.join('\n');
};

export default authors;
