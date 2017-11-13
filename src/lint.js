const chokidar = require('chokidar');
const path = require('path');
const CLIEngine = require('eslint').CLIEngine;
const cli = new CLIEngine({
  baseConfig: false,
  configFile: path.resolve(__dirname, '../.eslintrc')
});

module.exports = startLint;

function startLint({ src, watch }) {
  if (watch) {
    watchLint(src);
  } else {
    lint(src, watch);
  }
}

function lint(src, watch) {
  const report = cli.executeOnFiles([src]);
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

function watchLint(src) {
  chokidar
    .watch(path.join(process.cwd(), path.normalize(src), '/**/*.js'), {
      ignored: /(^|[\/\\])\../
    })
    .on('all', (event, path) => {
      lint(src, true);
    });
}
