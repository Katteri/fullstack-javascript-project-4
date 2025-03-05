#!/usr/bin/env node
import { program } from 'commander';
import downloadPage from '../src/index.js';

program
  .description('Page loader utility')
  .version('1.0.0')
  .helpOption('-h, --help', 'display help for command')
  .option('-o, --output [dir]', 'output dir', '/home/user/current-dir')
  .arguments('<url>')
  .action((url) => {
    const options = program.opts();
    downloadPage(url, options.output);
  });

program.parse();
