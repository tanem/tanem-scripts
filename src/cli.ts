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
    'generates an alphabetised list of authors in a format suitable for inclusion in an AUTHORS file'
  )
  .action(async () => {
    try {
      const result = await authors();
      process.stdout.write(result);
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  })
  .on('--help', () => {
    console.log(`
Examples:
  $ authors`);
  });

program
  .command('changelog')
  .description('generates a changelog using GitHub tags and pull requests')
  .option(
    '-f, --future-release <tag>',
    'tag to use for PRs merged since the last published tag'
  )
  .action(async cmd => {
    try {
      const result = await changelog({
        futureRelease: cmd.futureRelease
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
    $ changelog
    $ changelog -f v1.0.0
  `);
  });

program
  .command('release')
  .description('publishes a package to npm')
  .action(async () => {
    try {
      await release();
    } catch (error) {
      process.exit(1);
    }
  })
  .on('--help', () => {
    console.log(`
  Examples:
    $ release
  `);
  });

program.parse(process.argv);
