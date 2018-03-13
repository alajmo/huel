const chalk = require('chalk');

module.exports = {
  'test__update-check-message--success': 'update-check passed',
  'test__update-check-message--warning': 'update-check warning',
  'test__update-check-status-message--success': `   - ${moduleName} (${chalk.magenta( installed)}) isn't up to date (${chalk.green(latest)})\n`,
  'test__update-check-status-message--warning': `   - ${moduleName} (${chalk.green( installed)}) is up to date (${chalk.green(latest)})\n`
};
