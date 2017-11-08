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
    console.log(formatter(report.results));
    if (!watch) {
      process.exit(1);
    }
  }
}

function watchLint(entry) {
  chokidar
    .watch(path.join(entry, '**/*.js'), { ignored: /(^|[\/\\])\../ })
    .on('all', (event, path) => {
      // TODO: Perhaps implement when watching to only show error messages for 1 file
      // at a time.
      lint(entry, true);
    });
}
