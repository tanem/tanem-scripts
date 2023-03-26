// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import execa from 'execa';
import { get as getData } from './data';

const authors = async (): Promise<string> => {
  const { commits } = await getData();

  const authors = commits
    .map((commit) => {
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
