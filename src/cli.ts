#!/usr/bin/env node

import program from 'commander';
import { audit } from './audit';
import { authors } from './authors';

program
  .command('audit')
  .description('fix security vulnerabilities')
  .action(async () => {
    try {
      await audit();
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  });

program
  .command('authors')
  .description('write an AUTHORS file to process.cwd()')
  .action(async () => {
    try {
      await authors();
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  });

program.parse(process.argv);
