const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const defaultConfig = require('../../config/hal.config.json');

module.exports = startInfo;

function startInfo() {
  const configDirPath = path.join(__dirname, '../../config');
  const configPaths = {
    jsPrettier: path.join(configDirPath, '.prettierrc'),
    jsonPrettier: path.join(configDirPath, '.json.prettierrc'),
    cssPrettier: path.join(configDirPath, '.css.prettierrc'),
    commitlint: path.join(configDirPath, 'commitlint.config.js'),
    eslint: path.join(configDirPath, '.eslintrc'),
    postcss: path.join(configDirPath, 'postcss.config.js'),
    sizeLimit: path.join(configDirPath, '.size-limit.js'),
    webpackProd: path.join(configDirPath, 'webpack.prod.config.js'),
    webpackDev: path.join(configDirPath, 'webpack.dev.config.js'),
    webpacDevServerk: path.join(configDirPath, 'webpack-dev-server.config.js')
  };
  process.stdout.write(`${chalk.bold('\nConfigs')} used:\n`);
  Object.keys(configPaths).forEach(key => {
    console.log(`- ${key}: ${chalk.green(configPaths[key])}`);
  });
  // config files used:

  // Main modules used:
  const pkg = require(path.join(__dirname, '../../package.json'));
  const modules = {
    '@commitlint/core': pkg.dependencies['@commitlint/core'],
    'babel-core': pkg.dependencies['babel-core'],
    autoprefixer: pkg.dependencies['autoprefixer'],
    'conventional-changelog': pkg.dependencies['conventional-changelog'],
    eslint: pkg.dependencies['eslint'],
    husky: pkg.dependencies['husky'],
    postcss: pkg.dependencies['postcss'],
    prettier: pkg.dependencies['prettier'],
    'size-limit': pkg.dependencies['size-limit'],
    webpack: pkg.dependencies['webpack']
  };

  process.stdout.write(`${chalk.bold('\nModules')} used:\n`);
  Object.keys(modules).forEach(key => {
    console.log(`- ${key}: ${chalk.green(modules[key])}`);
  });
}
