module.exports = {
  getResolvedAliases,
  printSuccessMessage,
  printFailMessage,
  printWarningMessage,
  formatStatusMessage
};

const chalk = require('chalk');

/**
 * Given a directory path this function returns an object with keys as the
 * content directories of the input folder and values as their absolute paths.
 *
 * Ex: Given a src folder:
 *   - folder-a /
 *      -- folder-b
 *      -- folder-c
 * Calling getResolvedAliases('/folder-a/') will return:
 * {
 *  "folder-b": "/home/user/folder-a/folder-b,
 *  "folder-c": "/home/user/folder-a/folder-c
 * }
 * @param {String} src
 * @param {Object}
 */
function getResolvedAliases(src) {
  const { lstatSync, readdirSync } = require('fs');
  const { join, basename } = require('path');

  const isDirectory = source => lstatSync(source).isDirectory();
  const getDirectories = source =>
    readdirSync(source)
      .map(name => join(source, name))
      .filter(isDirectory);

  const directories = getDirectories(join(process.cwd(), src));

  return Object.assign(
    {},
    ...directories.map(dirPath => {
      return { [basename(dirPath)]: dirPath };
    })
  );
}

function printSuccessMessage(message) {
  console.log(`${chalk.green('✔︎')} ${chalk.bold(message)} `);
}

function printFailMessage(message) {
  console.log(`${chalk.red('✖')} ${chalk.bold(message)}`);
}

function printWarningMessage(message) {
  console.log(`${chalk.blue('ℹ')} ${chalk.bold(message)}`);
}

function formatStatusMessage(message) {
  return `   - ${message}`;
}
