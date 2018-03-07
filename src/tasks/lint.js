const chokidar = require('chokidar');
const path = require('path');
const CLIEngine = require('eslint').CLIEngine;
const cli = new CLIEngine({
  baseConfig: false,
  configFile: path.resolve(__dirname, '../../config/.eslintrc')
});
const chalk = require('chalk');

module.exports = startLint;

function startLint({ src, watch }) {
  const normalizedSrc = path.resolve(path.normalize(src));

  lint(normalizedSrc);
  if (watch) {
    console.log(`${chalk.bold('Watching: ')} ${normalizedSrc}`);
    watchLint(normalizedSrc);
  }
}

function lint(src) {
  // eslint does the globbing.
  const report = cli.executeOnFiles([src]);
  const errorReport = CLIEngine.getErrorResults(report.results);
  const formatter = cli.getFormatter();

  if (errorReport.length > 0) {
    // TODO: Decide if clearing console is wanted.
    // Clear console.
    // process.stdout.write('\x1Bc');
    console.error(formatter(report.results));
    const successMessage = 'Code is not ESlint compliant.\n';
    console.error(`${chalk.red(successMessage)}`);
    process.exit(1);
  } else {
    const successMessage = 'Code is ESLint compliant.';
    console.log(`${chalk.green(successMessage)}`);
  }
}

function watchLint(src) {
  chokidar
    .watch(path.join(src, '/**/*.js'), {
      ignored: /(^|[\/\\])\../,
      ignoreInitial: true
    })
    .on('all', (event, filepath) => {
      lint(filepath);
    });
}
