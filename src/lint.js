const chokidar = require('chokidar');
const path = require('path');
const CLIEngine = require('eslint').CLIEngine;
const cli = new CLIEngine({
  baseConfig: false,
  configFile: path.resolve(__dirname, '../.eslintrc.json')
});

module.exports = startLint;

function startLint({ entry, watch }) {
  if (watch) {
    watchLint(entry);
  } else {
    lint(entry, watch);
  }
}

function lint(entry, watch) {
  const report = cli.executeOnFiles([entry]);
  const errorReport = CLIEngine.getErrorResults(report.results);
  const formatter = cli.getFormatter();

  if (errorReport.length > 0) {
    // Clear console.
    process.stdout.write('\x1Bc');

    console.log(formatter(report.results));
    if (!watch) {
      process.exit(1);
    }
  } else {
    console.log('Code is ESLint compliant.');
  }
}

function watchLint(entry) {
  chokidar
    .watch(path.join(entry, '**/*.js'), { ignored: /(^|[\/\\])\../ })
    .on('all', (event, path) => {
      lint(entry, true);
    });
}
