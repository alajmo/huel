/**
 * Affirm that the Node.js and npm executable satisfied the Node and npm version
 * found in package.json.
 */
const chalk = require('chalk');
const { exitAndInform } = require('./error.js');
const semver = require('semver');

module.exports = {
  assertMinNodeVersion
};

function assertMinNodeVersion({
  moduleName,
  currentNodeProcessVersion,
  targetNodeVersionCondition,
  packageJsonPath
}) {
  if (
    !semver.valid(semver.coerce(targetNodeVersionCondition)) &&
    targetNodeVersionCondition !== '*'
  ) {
    return {
      message: `${chalk.bold(
        moduleName
      )}: Failed to read attribute engine.node from ${packageJsonPath}.
   Are you sure you have entered a valid node version?`,
      valid: false
    };
  }

  if (
    !semver.satisfies(currentNodeProcessVersion, targetNodeVersionCondition)
  ) {
    return {
      message: `   - ${chalk.bold(
        moduleName
      )}: wrong node version, expected node${chalk.green(
        targetNodeVersionCondition
      )} but found ${chalk.red(currentNodeProcessVersion)}!\n`,
      valid: false
    };
  }

  return { message: '', valid: true };
}
