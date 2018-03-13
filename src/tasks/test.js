const Depcheck = require('depcheck');
const PJV = require('package-json-validator').PJV;
const copy = require('../data/copy.js');
const bytes = require('bytes');
const chalk = require('chalk');
const checkNpmModules = require('npm-check');
const child = require('child_process');
const fs = require('fs');
const getSize = require('size-limit');
const globby = require('globby');
const moduleCheck = require('check-dependencies');
const path = require('path');
const pkgUp = require('pkg-up');
const readPkgUp = require('read-pkg-up');
const semver = require('semver');
const { assertMinNodeVersion } = require('../lib/check-node-version.js');
const {
  printSuccessMessage,
  printFailMessage,
  printWarningMessage,
  formatStatusMessage,
  getResolvedAliases
} = require('../lib/util.js');

module.exports = startTest;

const STATUS = {
  PASSED: 'PASSED',
  FAILED: 'FAILED',
  WARNING: 'WARNING',
  INFO: 'INFO'
};

async function startTest({
  bail,
  verbose,
  all,
  pjv,
  size,
  depcheck,
  nodecheck,
  moduleversioncheck,
  modulenodecheck,
  extraneousmodules,
  updateCheck,
  entry,
  ignoreDirs,
  strictversion
}) {
  let testStatuses = [];

  if (pjv || all) {
    const pjvTestStatus = await pjvTest({ verbose, bail });
    testStatuses.push(pjvTestStatus);
  }

  if (updateCheck || all) {
    const updateCheckTestStatus = await updateCheckTest(verbose);
    testStatuses.push(updateCheckTestStatus);
  }

  console.log(testStatuses);
  if (strictversion || all) {
    strictVersionCheck(verbose);
  }

  if (extraneousmodules || all) {
    extraneousModulesCheck(verbose);
  }

  if (depcheck || all) {
    depcheckTest({ entry, ignoreDirs });
  }

  if (nodecheck || all) {
    nodeCheck(verbose);
  }

  if (modulenodecheck || all) {
    moduleNodeCheck(verbose);
  }

  if (size || all) {
    sizeLimit({ size, verbose });
  }

  if (moduleversioncheck || all) {
    moduleVersionCheck(verbose);
  }

  // testStatuses.includes(STATUS.FAILED) ?
}

function testTemplate({
  successMessage = '',
  failMessage = '',
  warningMessage = '',
  testStatus = 'FAILED',
  statusMessages = '',
  bail = false,
  verbose = false
}) {
  switch (testStatus) {
    case STATUS.PASSED:
      printSuccessMessage(successMessage);
      break;
    case STATUS.FAILED:
      printFailMessage(failMessage);
      break;
    case STATUS.WARNING:
      printWarningMessage(warningMessage);
      break;
    default:
  }

  if ([STATUS.FAILED, STATUS.WARNING].includes(testStatus) || verbose) {
    console.log(statusMessages);
  }

  if (bail && STATUS.FAILED === testStatus) {
    process.exit(1);
  }
}

/** Check for mandatory package.json attributes. */
async function pjvTest({ verbose, bail }) {
  const test = () => {
    const pkg = require(path.join(process.cwd(), 'package.json'));
    let output = PJV.validate(JSON.stringify(pkg), 'npm', {
      warnings: true,
      recommendations: true
    });

    let testStatus = STATUS.PASSED;
    let statusMessages = '';
    if (output.errors) {
      testStatus = STATUS.FAILED;
      statusMessages += copy['test__pjv-status-message-header--failed']();
      output.errors.forEach(element => {
        statusMessages += copy['test__pjv-status-pjv-message-body--failed'](
          element
        );
      });
    }

    if (output.warnings) {
      statusMessages += copy['test__pjv-status-message-header--warning']();
      output.warnings.forEach(element => {
        statusMessages += copy['test__pjv-status-pjv-message-body--warning'](
          element
        );
      });
    }

    if (output.recommendations) {
      statusMessages += copy[
        'test__pjv-status-message-header--recommendations'
      ]();
      output.recommendations.forEach(element => {
        statusMessages += copy[
          'test__pjv-status-pjv-message-body--recommendations'
        ](element);
      });
    }

    return { testStatus, statusMessages };
  };

  const { testStatus = STATUS.FAILED, statusMessages = '' } = await test();

  testTemplate({
    successMessage: copy['test__pjv-message--success'],
    failMessage: copy['test__pjv-message--failed'],
    warningMessage: copy['test__pjv-message--warning'],
    testStatus,
    statusMessages,
    bail,
    verbose
  });

  return testStatus;
}

/** Checks if you are using the latest version of your dependencies. Only
 *  warns in case you are not using the latest.  */
async function updateCheckTest(verbose) {
  const test = () =>
    checkNpmModules({ skipUnused: true })
      .then(currentState => {
        const packages = currentState.get('packages');

        let testStatus = STATUS.PASSED;
        let statusMessages = '';
        packages.forEach(pkg => {
          const { moduleName, installed, latest } = pkg;
          if (semver.neq(installed, latest)) {
            testStatus = STATUS.WARNING;
            statusMessages += copy[
              'test__update-check-status-message--warning'
            ]({ moduleName, installed, latest });
          } else {
            statusMessages += copy[
              'test__update-check-status-message--success'
            ]({ moduleName, installed, latest });
          }
        });

        return { testStatus, statusMessages };
      })
      .catch(err => {
        throw err;
      });

  const { testStatus = STATUS.FAILED, statusMessages = '' } = await test();

  testTemplate({
    successMessage: copy['test__update-check-message--success'],
    warningMessage: copy['test__update-check-message--warning'],
    testStatus,
    statusMessages,
    verbose
  });

  return testStatus;
}

function extraneousModulesCheck(verbose) {
  const extraneousModulesJson = child.execSync('npm prune --dry-run --json', {
    encoding: 'utf-8'
  });
  const extraneousModules = JSON.parse(extraneousModulesJson);

  let extraneousModulesPassed = true;
  let extraneousModulesStatusMessages = '';

  if (extraneousModules.removed.length > 0) {
    extraneousModulesPassed = false;
    extraneousModulesStatusMessages += `   - ${chalk.bold(
      extraneousModules.removed.length
    )} extraneous modules found in node_modules`;
  } else {
    extraneousModulesStatusMessages +=
      '   - no extraneous modules found in node_modules';
  }

  const successMessage = `${chalk.green('✔︎')}  ${chalk.bold(
    'extraneous modules check passed'
  )}`;
  const failMessage = `${chalk.red('✖')}  ${chalk.bold(
    'extraneous modules check failed'
  )}`;

  extraneousModulesPassed
    ? console.log(successMessage)
    : console.log(failMessage);

  if (!extraneousModulesPassed || verbose) {
    console.log(extraneousModulesStatusMessages);
  }

  if (!extraneousModulesPassed) {
    process.exit(1);
  }
}

var matcher = /^(?:\w+:)?\/\/([^\s\.]+\.\S{2}|localhost[\:?\d]*)\S*$/;

/**
 * Loosely validate a URL `string`.
 *
 * @param {String} string
 * @return {Boolean}
 */

function isUrl(string) {
  return matcher.test(string);
}

function strictVersionCheck(verbose) {
  const {
    pkg: { dependencies: dependencies, devDependencies: devDependencies }
  } = readPkgUp.sync();

  const check = dependencies => {
    let status = 0;
    let logs = '';
    Object.keys(dependencies).forEach(moduleName => {
      const version = dependencies[moduleName];
      if (semver.valid(version) === null && !isUrl(version)) {
        console.log(version);
        status = 1;
        logs += `   - ${moduleName} (${chalk.red(version)})\n`;
      } else {
        logs += `   - ${moduleName} (${chalk.green(version)})\n`;
      }
    });

    return { status, logs };
  };

  dependenciesCheck = check(dependencies);
  devDependenciesCheck = check(devDependencies);

  if ([dependenciesCheck.status, devDependenciesCheck.status].includes(1)) {
    const failMessage = `${chalk.red('✖')}  ${chalk.bold(
      'strict version check failed'
    )}`;
    console.log(failMessage);
    process.stdout.write(
      `${dependenciesCheck.logs}${devDependenciesCheck.logs}`
    );
    process.exit(1);
  } else {
    const successMessage = `${chalk.green('✔︎')}  ${chalk.bold(
      'strict version check passed'
    )}`;
    console.log(successMessage);
    if (verbose) {
      process.stdout.write(
        `${dependenciesCheck.logs}${devDependenciesCheck.logs}`
      );
    }
  }
}

// Verifies that the correct Node.js version is installed for the current
// application.
function nodeCheck(verbose) {
  const currentNodeProcessVersion = semver.coerce(process.version).raw;
  const {
    pkg: { engines: { node: targetNodeVersionCondition }, name: moduleName }
  } = readPkgUp.sync();

  const { message, valid } = assertMinNodeVersion({
    moduleName,
    currentNodeProcessVersion,
    targetNodeVersionCondition,
    packageJsonPath: pkgUp.sync()
  });

  if (valid) {
    const successMessage = `${chalk.green('✔︎')}  ${chalk.bold(
      'node version check successful'
    )}`;
    console.log(successMessage);
    if (verbose) {
      console.log(
        `   - node: installed  ${chalk.green(
          currentNodeProcessVersion
        )},  expected: node ${chalk.green(targetNodeVersionCondition)}`
      );
    }
  } else {
    const failmessage = `${chalk.red('✖')}  ${chalk.bold(
      'node version check failed'
    )}`;
    console.log(failmessage);
    console.log(message);
    process.exit(1);
  }
}

// Make sure modules are synced between package.json and package-lock.json.
// Also verifies that the package is found in node_modules.
function moduleVersionCheck(verbose) {
  const { status, log, error } = moduleCheck.sync();
  let moduleVersionCheckPassed = true;
  let statusMessage = '';
  if (status === 1) {
    moduleVersionCheckPassed = false;
    error.forEach((element, i, arr) => {
      // All elements except the last because
      // module check-dependencies includes the string
      // 'Invoke npm install to install missing packages'
      // as the last element in the array.
      if (i < arr.length - 1) {
        statusMessage += `   - ${element.replace('!', '')}\n`;
      }
    });
  }

  const successMessage = `${chalk.green('✔︎')}  ${chalk.bold(
    'module version check successful'
  )}`;
  const failMessage = `${chalk.red('✖')}  ${chalk.bold(
    'module version check failed'
  )}`;

  moduleVersionCheckPassed
    ? console.log(successMessage)
    : console.log(failMessage);

  if (!moduleVersionCheckPassed) {
    console.log(statusMessage);
    process.exit(1);
  } else if (verbose) {
    log.forEach(element => {
      console.log(`   - ${element}`);
    });
  }
}

// Verifies that the correct Node.js version is installed for the
// dependencies found in package.json.
function moduleNodeCheck(verbose) {
  const pkg = require(path.join(process.cwd(), 'package.json'));
  const nodeModulesPath = path.join(process.cwd());
  const currentNodeProcessVersion = semver.coerce(process.version).raw;

  let modulenodecheckPassed = true;
  const check = dependencies => {
    let installedMessage = '';
    Object.keys(dependencies).forEach(moduleName => {
      const packageJsonPath = path.join(
        nodeModulesPath,
        'node_modules',
        moduleName,
        'package.json'
      );
      if (!fs.existsSync(packageJsonPath)) {
        return;
      }

      const tpkg = require(packageJsonPath);
      if (tpkg.engines === undefined) {
        return;
      }
      const targetNodeVersionCondition = tpkg.engines.node;

      const { message, valid } = assertMinNodeVersion({
        moduleName,
        currentNodeProcessVersion,
        targetNodeVersionCondition,
        packageJsonPath
      });

      if (valid) {
        installedMessage += `   - node: installed ${chalk.green(
          currentNodeProcessVersion
        )}, ${moduleName} (${chalk.green(
          tpkg.version
        )}) expected: node ${chalk.green(targetNodeVersionCondition)}\n`;
      } else {
        modulenodecheckPassed = false;
        installedMessage += message;
      }
    });

    return installedMessage;
  };

  let installedModules = '';
  installedModules += check(pkg.dependencies);
  installedModules += check(pkg.devDependencies);

  if (modulenodecheckPassed) {
    const successMessage = `${chalk.green('✔︎')}  ${chalk.bold(
      'module node version check successful'
    )}`;
    console.log(successMessage);
    if (verbose) {
      process.stdout.write(`${installedModules}`);
    }
  } else {
    const failmessage = `${chalk.red('✖')}  ${chalk.bold(
      'module node version check failed'
    )}`;
    console.log(failmessage);
    process.stdout.write(`${installedModules}`);
  }
}

// Check unused and missing dependencies. The following cases are considered:
// 1. Module is specified in package.json (dependencies or devDependencies key)
//    but then missing in code.
// 2. Module is used in code but missing in package.json
// 3. Files that cannot be accessed or parsed.
// 4. Directories that cannot be accessed.
function depcheckTest({ entry, ignoreDirs }) {
  const resolveAliases = getResolvedAliases(entry);

  // Custom detector (parses the modules differently.
  const webpackAliasDetect = node => {
    if (node.type === 'ImportDeclaration' && node.source && node.source.value) {
      for (let key in resolveAliases) {
        if (
          node.source.value.startsWith(key + '/') ||
          node.source.value === key
        ) {
          return [
            path.resolve(
              path.join(resolveAliases[key]),
              '..',
              node.source.value
            )
          ];
        }
      }

      return [node.source.value];
    }
    return [];
  };

  const options = {
    ignoreBinPackage: true,
    ignoreMatches: ['huel'],
    ignoreDirs: [ignoreDirs],
    detectors: [Depcheck.detector.requireCallExpression, webpackAliasDetect],
    specials: [Depcheck.special.eslint, Depcheck.special.webpack]
  };

  const cwd = path.join(process.cwd());
  Depcheck(cwd, options, unused => {
    let dependencyCheckPassed = true;
    let statusMessage = '';

    // No reference found to modules in dependencies attribute.
    if (unused.dependencies.length > 0) {
      dependencyCheckPassed = false;
      statusMessage += `   ${chalk.underline('Unused dependencies:\n')}`;
      unused.dependencies.forEach(dep => (statusMessage += `   - ${dep}\n`));
    }

    // No reference found to modules in devDependencies attribute.
    if (unused.devDependencies.length > 0) {
      dependencyCheckPassed = false;
      statusMessage += `   ${chalk.underline('Unused devDependencies:\n')}`;
      unused.devDependencies.forEach(dep => (statusMessage += `   - ${dep}\n`));
    }

    // References found in code but no equivalent in package.json.
    if (Object.keys(unused.missing).length > 0) {
      dependencyCheckPassed = false;
      statusMessage += `   ${chalk.underline('Missing dependencies:\n')}`;
      Object.keys(unused.missing).forEach(
        dep => (statusMessage += `   - ${dep}\n`)
      );
    }

    // Files can't be accessed or parsed.
    if (Object.keys(unused.invalidFiles).length > 0) {
      dependencyCheckPassed = false;
      statusMessage += `   ${chalk.underline('Invalid files:\n')}`;
      Object.keys(unused.invalidFiles).forEach(
        file => (statusMessage += `   - ${file}\n`)
      );
    }

    // Directories can't accessed.
    if (Object.keys(unused.invalidDirs).length > 0) {
      dependencyCheckPassed = false;
      statusMessage += `   ${chalk.underline('Invalid directories:\n')}`;
      Object.keys(unused.invalidDirs).forEach(
        dir => (statusMessage += `   - ${dir}\n`)
      );
    }

    const successMessage = `${chalk.green('✔︎')}  ${chalk.bold(
      'dependency check passed'
    )}`;
    const failMessage = `${chalk.red('✖')}  ${chalk.bold(
      'dependency check failed'
    )}`;

    dependencyCheckPassed
      ? console.log(successMessage)
      : console.log(failMessage);

    if (!dependencyCheckPassed) {
      console.log(statusMessage);
      process.exit(1);
    }
  });
}

/**
 * @desc Checks size limit of files.
 * @param {string|boolean} size If string then assumed to be a path to size-limit config file.
 */
function sizeLimit({ size, verbose }) {
  const sizeConfigPath =
    typeof size === 'string'
      ? path.resolve(process.cwd(), size)
      : path.resolve(__dirname, '../../config/size-limit.js');

  let sizeLimits = require(sizeConfigPath)();
  Array.isArray(sizeLimits) ? '' : (sizeLimits = [sizeLimits]);

  sizeLimits.forEach(limit => {
    globby(limit.path, { cwd: process.cwd() })
      .then(files => {
        if (files.length > 0) {
          getSize(files.map(file => path.join(process.cwd(), file)))
            .then(size => {
              const limitNum = bytes.parse(limit.limit);
              const sizeNum = bytes.parse(size);
              const diff = sizeNum - limitNum;
              if (diff > 0) {
                process.stdout.write(
                  `  ${chalk.red(
                    'package size limit has exceeded by ' + formatBytes(diff)
                  )}\n` +
                    `   package size: ${chalk.bold(
                      chalk.red(formatBytes(sizeNum))
                    )}\n` +
                    `   size limit:   ${chalk.bold(formatBytes(limitNum))}\n`
                );
                process.exit(1);
              } else {
                const successMessage = `${chalk.green('✔︎')}  ${chalk.bold(
                  'valid size limit'
                )}`;
                console.log(successMessage);

                if (verbose) {
                  process.stdout.write(
                    `   package size: ${chalk.bold(formatBytes(sizeNum))}\n` +
                      `   size limit:   ${chalk.bold(formatBytes(limitNum))}\n`
                  );
                }
              }
            })
            .catch(err => {
              console.error(err);
            });
        }
      })
      .catch(err => {
        console.error(err);
      });
  });
}

function formatBytes(size) {
  return bytes.format(size, { unitSeparator: ' ' });
}
