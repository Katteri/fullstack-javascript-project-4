import { Command } from 'commander';
import debugLib from 'debug';
import pageLoader from './page-loader.js';

export default () => {
  const commanderConfig = new Command();

  return commanderConfig
    .description(
      `Page loader utility.\n
    For using this cli program you need write URL a website which you need to download.
    Format for working: page-loader <URL> [-o <path to folder for saving>]`,
    )
    .version('0.1.4')
    .arguments('<url>')
    .option(
      '-o, --output <path>',
      'output dir',
    )
    .option(
      '-d, --debug',
      'flag for debug messages',
      false,
    )
    .action((url) => {
      const { output, debug: debugFlag } = commanderConfig.opts();
      if (debugFlag) debugLib.enable('page-loader:*');
      pageLoader(url, output)
      // eslint-disable-next-line no-console
        .then((pathFile) => console.log(`Path to HTML: ${pathFile}`))
        .catch((e) => {
          // eslint-disable-next-line no-console
          console.error('CLI Output: ', e.message);
          process.exit(1);
        });
    })
    .parse();
};
