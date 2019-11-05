#!/usr/bin/env node

import program from 'commander';
import authors from './authors';
import changelog from './changelog';
import release from './release';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { description, version } = require('../package.json');

program
  .version(version)
  .name('tanem-scripts')
  .description(description);

program.on('command:*', function() {
  console.error(
    'Invalid command: %s\nSee --help for a list of available commands.',
    program.args.join(' ')
  );
  process.exit(1);
});

program
  .command('authors')
  .description(
    'generates a list of authors in a format suitable for inclusion in an AUTHORS file'
  )
  .option('-n, --numbered', 'sort by number of commits per author')
  .action(async cmd => {
    try {
      const result = await authors({ isNumbered: cmd.numbered });
      process.stdout.write(result);
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  })
  .on('--help', () => {
    console.log(`
Examples:
  $ authors
  $ authors -n`);
  });

program
  .command('changelog')
  .description('generates a changelog using GitHub tags and pull requests')
  .option(
    '-f, --future-release <tag>',
    'tag to use for PRs merged since the last published tag'
  )
  .option('-o, --owner <owner>', 'repo owner')
  .option('-r, --repo <repo>', 'repo name')
  .action(async cmd => {
    try {
      const result = await changelog({
        futureRelease: cmd.futureRelease,
        owner: cmd.owner,
        repo: cmd.repo
      });
      process.stdout.write(result);
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  })
  .on('--help', () => {
    console.log(`
  Examples:
    $ changelog -f v1.0.0
    $ changelog -o tanem -r react-svg
    $ changelog -f v2.0.0 -o tanem -r react-svg
  `);
  });

program
  .command('release')
  .description('publishes a package to npm')
  .option('-o, --owner <owner>', 'repo owner')
  .option('-r, --repo <repo>', 'repo name')
  .action(async cmd => {
    try {
      const result = await release({
        owner: cmd.owner,
        repo: cmd.repo
      });
      process.stdout.write(result);
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  })
  .on('--help', () => {
    console.log(`
  Examples:
    $ release -o tanem -r react-svg
  `);
  });

program.parse(process.argv);
