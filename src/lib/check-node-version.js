/**
 * Affirm that the Node.js and npm executable satisfied the Node and npm version
 * found in package.json.
 */

const { exitAndInform } = require('./error.js');
const semver = require('semver');

module.exports = {
  assertMinNodeVersion,
  assertMinNpmVersion
};

function assertMinNodeVersion({
  moduleName,
  currentNodeProcessVersion,
  targetNodeVersionCondition,
  packageJsonPath
}) {
  if (!semver.valid(semver.coerce(targetNodeVersionCondition))) {
    exitAndInform(
      `Failed to read attribute engine.node from ${packageJsonPath}
   Are you sure you have entered a valid npm version?
    `
    );
  }

  if (
    !semver.satisfies(currentNodeProcessVersion, targetNodeVersionCondition)
  ) {
    exitAndInform(
      `${moduleName}: Wrong Node.js version, expected node${
        targetNodeVersionCondition
      } but found ${currentNodeProcessVersion}!`
    );
  }
}

function assertMinNpmVersion({
  moduleName,
  currentNpmProcessVersion,
  targetNpmVersionCondition,
  packageJsonPath
}) {
  if (!semver.valid(semver.coerce(targetNpmVersionCondition))) {
    exitAndInform(
      `Failed to read attribute engine.npm from ${packageJsonPath}.
   Are you sure you have entered a valid npm version?`
    );
  }

  if (!semver.satisfies(currentNpmProcessVersion, targetNpmVersionCondition)) {
    exitAndInform(
      `${moduleName}: Wrong npm version, expected npm${targetNpmVersionCondition} but found ${
        currentNpmProcessVersion
      }!`
    );
  }
}
