colors = require('chalk');
const pkg = require('./package.json');

// https://github.com/sindresorhus/pkg-up
// https://github.com/sindresorhus/read-pkg
// https://github.com/sindresorhus/read-pkg-up
const version = parseFloat( process.version.substr(1) );

module.exports = function (minimum) {
  if (version >= minimum) {
    return true;
  }

        const errorMessage = chalk.yellow(`
                requires at least node@${minimum}!
                You have node@${version}

        `);

  // version not supported && exit
  process.stdout.write(errorMessage) + '\n';
  process.exit(1);
};

