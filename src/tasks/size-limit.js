module.exports = sizeLimit;

const bytes = require('bytes');
const chalk = require('chalk');
const getSize = require('size-limit');
const globby = require('globby');
const path = require('path');

function sizeLimit(dest) {
  let sizeLimits = require(path.resolve(
    __dirname,
    '../../config/size-limit.js'
  ))(dest);

  Array.isArray(sizeLimits) ? '' : (sizeLimits = [sizeLimits]);

  sizeLimits.forEach(limit => {
    globby(limit.path, { cwd: process.cwd() })
      .then(files => {
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
                `  Package size: ${chalk.bold(chalk.green(sizeNum))}\n` +
                  `  Size limit:   ${chalk.bold(limitNum)}\n`
              );
            }
          })
          .catch(err => {
            console.error(err);
          });
      })
      .catch(err => {
        console.error(err);
      });
  });
}

function formatBytes(size) {
  return bytes.format(size, { unitSeparator: ' ' });
}
