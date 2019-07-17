#!/usr/bin/env node

import program from 'commander'
import { audit } from '../src/audit'

program
  .command('audit')
  .description('run a security audit')
  .option('-f, --fix', 'fix vulnerabilities')
  .action(cmd => {
    audit({ fix: cmd.fix })
  })

program.parse(process.argv)
