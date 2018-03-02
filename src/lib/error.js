const chalk = require('chalk');

module.exports = { exitAndInform, HalError };

function HalError(message) {
  const error = new Error(message);

  Error.captureStackTrace();

  return error;
}

function exitAndInform(message) {
  console.error(`${chalk.red('✖')}  ${message}`);
  process.exit(1);
}
