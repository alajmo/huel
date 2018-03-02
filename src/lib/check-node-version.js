/**
 * Affirm that the Node executable satisfied the Node version
 * found in the corresponding package.json file.
 */

const { exitAndInform } = require('./error.js');
const readPkgUp = require('read-pkg-up');
const pkgUp = require('pkg-up');
const semver = require('semver');
const child = require('child_process');

main();
function main() {
  assertMinNodeVersion();
  assertMinNpmVersion();
}

function assertMinNodeVersion() {
  const {
    pkg: { engines: { node: targetNodeVersionCondition } }
  } = readPkgUp.sync();

  if (!semver.valid(semver.coerce(targetNodeVersionCondition))) {
    exitAndInform(
      `Failed to read attribute engine.node from ${pkgUp.sync()}
   Are you sure you have entered a valid npm version?
    `
    );
  }
  // const currentNodeProcessVersion = '1.2.2'
  const currentNodeProcessVersion = semver.coerce(process.version).raw;

  if (
    !semver.satisfies(currentNodeProcessVersion, targetNodeVersionCondition)
  ) {
    exitAndInform(
      `Wrong Node.js version, expected node${
        targetNodeVersionCondition
      } but found ${currentNodeProcessVersion}!`
    );
  }
}

function assertMinNpmVersion() {
  const {
    pkg: { engines: { npm: targetNpmVersionCondition } }
  } = readPkgUp.sync();

  if (!semver.valid(semver.coerce(targetNpmVersionCondition))) {
    exitAndInform(
      `Failed to read attribute engine.npm from ${pkgUp.sync()}.
   Are you sure you have entered a valid npm version?`
    );
  }

  const currentNpmProcessVersion = semver.coerce(
    child.execSync('npm --version', {
      encoding: 'utf-8'
    })
  );

  if (!semver.satisfies(currentNpmProcessVersion, targetNpmVersionCondition)) {
    exitAndInform(
      `Wrong npm version, expected npm${targetNpmVersionCondition} but found ${
        currentNpmProcessVersion
      }!`
    );
  }
}
