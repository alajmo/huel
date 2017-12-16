const chokidar = require('chokidar');
const path = require('path');
const CLIEngine = require('eslint').CLIEngine;
const cli = new CLIEngine({
  baseConfig: false,
  configFile: path.resolve(__dirname, '../../config/.eslintrc')
});
const colors = require('../lib/colors.js');

module.exports = startLint;

function startLint({ src, watch }) {
  const normalizedSrc = path.resolve(path.normalize(src));

  lint(normalizedSrc);
  if (watch) {
    console.log(`${colors.bold}Watching: ${colors.reset}${normalizedSrc}`);
    watchLint(normalizedSrc);
  }
}

function lint( src ) {
  // eslint does the globbing.
  const report = cli.executeOnFiles([src]);
  const errorReport = CLIEngine.getErrorResults(report.results);
  const formatter = cli.getFormatter();

  if (errorReport.length > 0) {
    // TODO: Decide if clearing console is wanted.
    // Clear console.
    // process.stdout.write('\x1Bc');
    console.log(formatter(report.results));
    const successMessage = 'Code has been linted with ESLint.';
    console.log(`${colors.green}${successMessage}${colors.reset}`);
  } else {
    const successMessage = 'Code is ESLint compliant.';
    console.log(`${colors.green}${successMessage}${colors.reset}`);
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