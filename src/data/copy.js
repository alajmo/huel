const chalk = require('chalk');

const FILLER = '   - ';

module.exports = {
  // update-check
  'test__update-check-message--success': ' update-check passed',
  'test__update-check-message--warning': ' update-check warning',
  'test__update-check-status-message--success': ({
    moduleName,
    installed,
    latest
  }) =>
    `${FILLER}${moduleName} (${chalk.green(
      installed
    )}) is up to date (${chalk.green(latest)})\n`,
  'test__update-check-status-message--warning': ({
    moduleName,
    installed,
    latest
  }) =>
    `${FILLER}${moduleName} (${chalk.magenta(
      installed
    )}) isn't up to date (${chalk.green(latest)})\n`,

  // pjv
  'test__pjv-message--success': ' valid package.json',
  'test__pjv-message--failed': ' invalid package.json',
  'test__pjv-message--warning': ' warnings found package.json',

  'test__pjv-status-message-header--failed': () =>
    `   Following package.json ${chalk.red('errors')} found: \n`,
  'test__pjv-status-pjv-message-body--failed': element =>
    `   - ${chalk.red(element)}\n`,

  'test__pjv-status-message-header--warning': () =>
    `   Following package.json ${chalk.magenta('warnings')} found: \n`,
  'test__pjv-status-pjv-message-body--warning': element =>
    `   - ${chalk.magenta(element)}\n`,

  'test__pjv-status-message-header--recommendations': () =>
    `   Following package.json ${chalk.yellow('recommendations')} found: \n`,
  'test__pjv-status-pjv-message-body--recommendations': element =>
    `   - ${chalk.yellow(element)}\n`
};
