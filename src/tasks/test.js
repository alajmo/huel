const {
  assertMinNodeVersion,
  assertMinNpmVersion
} = require('../lib/check-node-version.js');
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
  entry,
  ignoreDirs
}) {
  if (pjv || all) {
    // Check for mandatory package.json attributes.
    validatePackageJson();
  }

  if (depcheck || all) {
    // Check unused and missing dependencies.
    depcheckTest({ entry, ignoreDirs });
  }

  if (nodecheck || all) {
    // This Node version check validates users application dependency on Node.
    nodeCheck(verbose);
  }

  if (npmcheck || all) {
    // This Node version check validates users application dependency on Node.
    npmCheck(verbose);
  }

  if (modulenodecheck || all) {
    // This Node version check validates users module dependencies on Node.
    moduleNodeCheck(verbose);
  }

  if (moduleversioncheck || all) {
    // Make sure modules are synced between package.json and package-lock.json.
    moduleVersionCheck(verbose);
  }

  if (size || all) {
    // Add size limit to files.
    sizeLimit({ size, verbose });
  }
}

function npmCheck(verbose) {
  const currentNpmProcessVersion = semver.coerce(
    child.execSync('npm --version', {
      encoding: 'utf-8'
    })
  );
  const {
    pkg: { engines: { npm: targetNpmVersionCondition } }
  } = readPkgUp.sync();

  assertMinNpmVersion({
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
      `   ${'npm: installed '} ${currentNpmProcessVersion}, expected: npm ${
        targetNpmVersionCondition
      }`
    );
  }
}

function nodeCheck(verbose) {
  const currentNodeProcessVersion = semver.coerce(process.version).raw;
  const {
    pkg: { engines: { node: targetNodeVersionCondition } }
  } = readPkgUp.sync();

  assertMinNodeVersion({
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
      `   ${'node: installed '} ${currentNodeProcessVersion}, expected: node ${
        targetNodeVersionCondition
      }`
    );
  }
}

function moduleVersionCheck(verbose) {
  const { status, log, error } = moduleCheck.sync();
  if (status === 1) {
    error.forEach(element => {
      console.error(`   ${element}`);
    });

    process.exit(1);
  } else {
    const successMessage = `${chalk.green('✔︎')}  ${chalk.bold(
      'module version check successful'
    )}`;
    console.log(successMessage);
    if (verbose) {
      log.forEach(element => {
        console.log(`   ${element}`);
      });
    }
  }
}

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
      const tpkg = require(packageJsonPath);
      if (tpkg.engines === undefined) {
        return;
      }
      const targetNodeVersionCondition = tpkg.engines.node;

      assertMinNodeVersion({
        currentNodeProcessVersion,
        targetNodeVersionCondition,
        packageJsonPath: pkgUp.sync()
      });

      installedMessage += `${'   node: installed '} ${
        currentNodeProcessVersion
      }, ${chalk.bold(moduleName)} (${tpkg.version}) expected: node ${
        targetNodeVersionCondition
      }\n`;
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

function depcheckTest({ entry, ignoreDirs }) {
  const resolveAliases = {
    components: path.join(process.cwd(), entry, 'components'),
    res: path.join(process.cwd(), entry, 'res'),
    lib: path.join(process.cwd(), entry, 'lib'),
    pages: path.join(process.cwd(), entry, 'pages')
  };

  const webpackAliasDetect = node => {
    if (node.type === 'ImportDeclaration' && node.source && node.source.value) {
      for (let key in resolveAliases) {
        if (
          node.source.value.startsWith(key + '/') ||
          node.source.value === key
        ) {
          // console.log('node.source.value: ', node.source.value);
          // console.log('resolveAliases[key]: ', resolveAliases[key]);
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

  Depcheck(path.join(process.cwd()), options, unused => {
    let dependencyCheckPassed = true;

    if (unused.dependencies.length > 0) {
      dependencyCheckPassed = false;
      console.log('Unused dependencies:');
      unused.dependencies.forEach(dep => console.log(chalk.red(dep)));
      console.log();
    }
    if (unused.devDependencies.length > 0) {
      dependencyCheckPassed = false;
      console.log('Unused devDependencies:');
      unused.devDependencies.forEach(dep => console.log(chalk.red(dep)));
      console.log();
    }
    if (Object.keys(unused.missing).length > 0) {
      dependencyCheckPassed = false;
      console.log('Missing dependencies:');
      Object.keys(unused.missing).forEach(dep => console.log(chalk.red(dep)));
      console.log();
    }

    if (Object.keys(unused.invalidFiles).length > 0) {
      dependencyCheckPassed = false;
      console.log('Invalid files:');
      Object.keys(unused.invalidFiles).forEach(file =>
        console.log(chalk.red(file))
      );
      console.log();
    }

    if (Object.keys(unused.invalidDirs).length > 0) {
      dependencyCheckPassed = false;
      console.log('Invalid directories:');
      Object.keys(unused.invalidDirs).forEach(dir =>
        console.log(chalk.red(dir))
      );
      console.log();
    }

    const successMessage = `${chalk.green('✔︎')}  ${chalk.bold(
      'dependency check passed'
    )}`;
    const failMessage = `${chalk.red('✖')}  dependency check failed`;
    console.log(dependencyCheckPassed ? successMessage : failMessage);
  });
}

function validatePackageJson() {
  const pkg = require(path.join(process.cwd(), 'package.json'));
  let output = PJV.validate(JSON.stringify(pkg), 'npm', {
    warnings: true,
    recommendations: true
  });
  let invalid = false;

  if (output.errors) {
    invalid = true;
    console.error('Following package.json errors found: \n');
    output.errors.forEach(element => {
      console.log(`${chalk.red(element)}\n`);
    });
  }

  if (output.warnings) {
    invalid = true;
    console.error('Following package.json warnings found: \n');
    output.warnings.forEach(element => {
      console.log(`${chalk.yellow(element)}\n`);
    });
  }

  if (output.recommendations) {
    invalid = true;
    console.error('Following package.json recommendations found: \n');
    output.recommendations.forEach(element => {
      console.log(`${chalk.green(element)}\n`);
    });
  }

  if (invalid) {
    process.exit();
  } else {
    console.log(`${chalk.green('✔︎')}  ${chalk.bold('valid package.json')}`);
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

function runTests(src) {
  const babelNodePath = path.join(
    '..',
    '..',
    'node_modules',
    'babel-cli',
    'bin',
    'babel-node.js'
  );

  child.exec(`${babelNodePath} ${src}`, (err, stdout, stderr) => {
    console.log(stdout);
    console.log(stderr);
    if (err !== null) {
      console.log('exec error: ' + err);
    }
  });
}
