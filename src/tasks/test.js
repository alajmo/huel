const PJV = require('package-json-validator').PJV;
const bytes = require('bytes');
const chalk = require('chalk');
const child = require('child_process');
const colors = require('../lib/colors.js');
const getSize = require('size-limit');
const globby = require('globby');
const path = require('path');

module.exports = startTest;

function startTest({ pjv, size }) {
  if (pjv) {
    validatePackageJson();
  }

  if (size) {
    sizeLimit(size);
  }
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
      console.log(`${colors.red}${element}${colors.reset}\n`);
    });
  }

  if (output.warnings) {
    invalid = true;
    console.error('Following package.json warnings found: \n');
    output.warnings.forEach(element => {
      console.log(`${colors.yellow}${element}${colors.reset}\n`);
    });
  }

  if (output.recommendations) {
    invalid = true;
    console.error('Following package.json recommendations found: \n');
    output.recommendations.forEach(element => {
      console.log(`${colors.green}${element}${colors.reset}\n`);
    });
  }

  if (invalid) {
    process.exit();
  } else {
    console.log(`${colors.green}Valid package.json${colors.reset}`);
  }
}

function sizeLimit(size) {
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
          getSize(files.map(file => path.join(process.cwd(), file)), {
            analyzer: 'static'
          })
            .then(size => {
              const limitNum = bytes.parse(limit.limit);
              const sizeNum = bytes.parse(size);
              const diff = sizeNum - limitNum;
              if (diff > 0) {
                process.stdout.write(
                  `  ${chalk.red(
                    'Package size limit has exceeded by ' + formatBytes(diff)
                  )}\n` +
                    `  Package size: ${chalk.bold(
                      chalk.red(formatBytes(sizeNum))
                    )}\n` +
                    `  Size limit:   ${chalk.bold(formatBytes(limitNum))}\n`
                );
                process.exit(1);
              } else {
                process.stdout.write(
                  `  Package size: ${chalk.bold(
                    chalk.green(formatBytes(sizeNum))
                  )}\n` +
                    `  Size limit:   ${chalk.bold(formatBytes(limitNum))}\n`
                );
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
