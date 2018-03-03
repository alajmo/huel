const fs = require('fs');
const {
  assertMinNodeVersion,
  assertMinNpmVersion
} = require('../lib/check-node-version.js');
const { getResolvedAliases } = require('../lib/util.js');
const Depcheck = require('depcheck');
const moduleCheck = require('check-dependencies');
const PJV = require('package-json-validator').PJV;
const bytes = require('bytes');
const chalk = require('chalk');
const child = require('child_process');
const getSize = require('size-limit');
const globby = require('globby');
const path = require('path');
const readPkgUp = require('read-pkg-up');
const pkgUp = require('pkg-up');
const semver = require('semver');
const checkNpmModules = require('npm-check');

module.exports = startTest;

function startTest({
  verbose,
  all,
  pjv,
  size,
  depcheck,
  nodecheck,
  npmcheck,
  moduleversioncheck,
  modulenodecheck,
  extraneousmodules,
  updatecheck,
  entry,
  ignoreDirs,
  strictversion
}) {
  if (updatecheck || all) {
    updateCheck(verbose);
  }

  if (pjv || all) {
    validatePackageJson(verbose);
  }

  if (strictversion || all) {
    strictVersionCheck(verbose);
  }

  if (extraneousmodules || all) {
    extraneousModulesCheck(verbose);
  }

  if (depcheck || all) {
    depcheckTest({ entry, ignoreDirs });
  }

  if (npmcheck || all) {
    npmCheck(verbose);
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
}

function updateCheck(verbose) {
  checkNpmModules({ skipUnused: true })
    .then(currentState => {
      const packages = currentState.get('packages');

      let updateCheckPassed = true;
      let statusMessage = '';
      packages.forEach(pkg => {
        const { moduleName, installed, latest } = pkg;
        if (semver.neq(installed, latest)) {
          updateCheckPassed = false;
          statusMessage += `   ${chalk.dim(moduleName)} (${chalk.magenta(
            installed
          )}) isn't up to date (${chalk.green(latest)})\n`;
        } else {
          statusMessage = `   ${chalk.dim(moduleName)} (${chalk.green(
            installed
          )}) is up to date (${chalk.green(latest)})\n`;
        }
      });

      const successMessage = `${chalk.green('✔︎')}  ${chalk.bold(
        'update check passed'
      )}`;
      const failMessage = `${chalk.blue('ℹ')}  ${chalk.bold(
        'update check failed'
      )}`;

      updateCheckPassed
        ? console.log(successMessage)
        : console.log(failMessage);

      if (!updateCheckPassed || verbose) {
        console.log(statusMessage);
      }
    })
    .catch(() => {});
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
    extraneousModulesStatusMessages += `   ${chalk.bold(
      extraneousModules.removed.length
    )} extraneous modules found in node_modules`;
  } else {
    extraneousModulesStatusMessages +=
      '   no extraneous modules found in node_modules';
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

function strictVersionCheck(verbose) {
  const {
    pkg: { dependencies: dependencies, devDependencies: devDependencies }
  } = readPkgUp.sync();

  const check = dependencies => {
    let status = 0;
    let logs = '';
    Object.keys(dependencies).forEach(moduleName => {
      const version = dependencies[moduleName];
      if (semver.valid(version) === null) {
        status = 1;
        logs += `   ${moduleName} (${chalk.red(version)})\n`;
      } else {
        logs += `   ${moduleName} (${chalk.green(version)})\n`;
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

// Verifies that the correct npm version is installed for the current
// application.
function npmCheck(verbose) {
  const currentNpmProcessVersion = semver.coerce(
    child.execSync('npm --version', {
      encoding: 'utf-8'
    })
  );
  const {
    pkg: { engines: { npm: targetNpmVersionCondition }, name: moduleName }
  } = readPkgUp.sync();

  assertMinNpmVersion({
    moduleName,
    currentNpmProcessVersion,
    targetNpmVersionCondition,
    packageJsonPath: pkgUp.sync()
  });

  const successMessage = `${chalk.green('✔︎')}  ${chalk.bold(
    'npm version check successful'
  )}`;
  console.log(successMessage);
  if (verbose) {
    console.log(
      `   npm: installed  ${chalk.green(
        currentNpmProcessVersion
      )}, expected: npm ${chalk.green(targetNpmVersionCondition)}`
    );
  }
}

// Verifies that the correct Node.js version is installed for the current
// application.
function nodeCheck(verbose) {
  const currentNodeProcessVersion = semver.coerce(process.version).raw;
  const {
    pkg: { engines: { node: targetNodeVersionCondition }, name: moduleName }
  } = readPkgUp.sync();

  assertMinNodeVersion({
    moduleName,
    currentNodeProcessVersion,
    targetNodeVersionCondition,
    packageJsonPath: pkgUp.sync()
  });

  const successMessage = `${chalk.green('✔︎')}  ${chalk.bold(
    'node version check successful'
  )}`;
  console.log(successMessage);
  if (verbose) {
    console.log(
      `   node: installed  ${chalk.green(
        currentNodeProcessVersion
      )}, expected: node ${chalk.green(targetNodeVersionCondition)}`
    );
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
        statusMessage += `   ${element.replace('!', '')}\n`;
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
      console.log(`   ${element}`);
    });
  }
}

// Verifies that the correct Node.js version is installed for the
// dependencies found in package.json.
function moduleNodeCheck(verbose) {
  const pkg = require(path.join(process.cwd(), 'package.json'));
  const nodeModulesPath = path.join(process.cwd());
  const currentNodeProcessVersion = semver.coerce(process.version).raw;

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

      assertMinNodeVersion({
        moduleName,
        currentNodeProcessVersion,
        targetNodeVersionCondition,
        packageJsonPath: pkgUp.sync()
      });

      installedMessage += `   node: installed  ${chalk.green(
        currentNodeProcessVersion
      )}, ${moduleName} (${chalk.green(
        tpkg.version
      )}) expected: node ${chalk.green(targetNodeVersionCondition)}\n`;
    });

    return installedMessage;
  };

  let installedModules = '';
  installedModules += check(pkg.dependencies);
  installedModules += check(pkg.devDependencies);

  const successMessage = `${chalk.green('✔︎')}  ${chalk.bold(
    'module node version check successful'
  )}`;
  console.log(successMessage);
  if (verbose) {
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
    ignoreMatches: ['hal'],
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
      unused.dependencies.forEach(dep => (statusMessage += `   ${dep}\n`));
    }

    // No reference found to modules in devDependencies attribute.
    if (unused.devDependencies.length > 0) {
      dependencyCheckPassed = false;
      statusMessage += `   ${chalk.underline('Unused devDependencies:\n')}`;
      unused.devDependencies.forEach(dep => (statusMessage += `   ${dep}\n`));
    }

    // References found in code but no equivalent in package.json.
    if (Object.keys(unused.missing).length > 0) {
      dependencyCheckPassed = false;
      statusMessage += `   ${chalk.underline('Missing dependencies:\n')}`;
      Object.keys(unused.missing).forEach(
        dep => (statusMessage += `   ${dep}\n`)
      );
    }

    // Files can't be accessed or parsed.
    if (Object.keys(unused.invalidFiles).length > 0) {
      dependencyCheckPassed = false;
      statusMessage += `   ${chalk.underline('Invalid files:\n')}`;
      Object.keys(unused.invalidFiles).forEach(
        file => (statusMessage += `   ${file}\n`)
      );
    }

    // Directories can't accessed.
    if (Object.keys(unused.invalidDirs).length > 0) {
      dependencyCheckPassed = false;
      statusMessage += `   ${chalk.underline('Invalid directories:\n')}`;
      Object.keys(unused.invalidDirs).forEach(
        dir => (statusMessage += `   ${dir}\n`)
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

// Check for mandatory package.json attributes.
function validatePackageJson(verbose) {
  // TODO: Error messages not in correct order, also check other test cases

  const pkg = require(path.join(process.cwd(), 'package.json'));
  let output = PJV.validate(JSON.stringify(pkg), 'npm', {
    warnings: true,
    recommendations: true
  });

  let pjvCheckPassed = true;
  let statusMessage = '';
  if (output.errors) {
    pjvCheckPassed = false;
    statusMessage += `   Following package.json ${chalk.red(
      'errors'
    )} found: \n`;
    output.errors.forEach(element => {
      statusMessage += `   - ${chalk.red(element)}\n`;
    });
  }

  if (output.warnings) {
    statusMessage += `   Following package.json ${chalk.yellow(
      'warnings'
    )} found: \n`;
    output.warnings.forEach(element => {
      statusMessage += `   - ${chalk.yellow(element)}\n`;
    });
  }

  if (output.recommendations) {
    statusMessage += `   Following package.json ${chalk.green(
      'recommendations'
    )} found: \n`;
    output.recommendations.forEach(element => {
      statusMessage += `   - ${chalk.green(element)}\n`;
    });
  }

  const successMessage = `${chalk.green('✔︎')}  ${chalk.bold(
    'valid package.json'
  )}`;
  const failMessage = `${chalk.red('✖')}  ${chalk.bold(
    'invalid package.json'
  )}`;

  pjvCheckPassed ? console.log(successMessage) : console.log(failMessage);

  if (verbose) {
    console.log(statusMessage);
  }

  if (!pjvCheckPassed) {
    console.log(statusMessage);
    process.exit(1);
  }
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
