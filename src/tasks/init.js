const util = require('util');
const path = require('path');
const fs = require('fs');
const glob = require('glob');
const chokidar = require('chokidar');
const prettier = require('prettier');
const colors = require('../lib/colors.js');

module.exports = startInit;

function startInit() {
  const pkgPath = path.join(process.cwd(), 'package.json');
  const numWhitespace = calcWhitespace(fs.readFileSync(pkgPath, 'utf-8'));
  const pkg = addGitHooks(require(pkgPath));
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, numWhitespace));

  console.log(`${colors.green}Git commit hooks added${colors.reset}`);
}

function addGitHooks(pkg) {
  return Object.assign(pkg, {
    scripts: Object.assign({}, pkg.scripts, {
      // precommit: 'npm test',
      prepush: 'npm test',
      commitmsg: 'commitlint -e $GIT_PARAMS'
    })
  });
}

function calcWhitespace(str) {
  let strRemovedNewline = str.replace(/\n/g, '');
  let res = /{[ \t]+\"/.exec(strRemovedNewline)[0];
  let numWhitespace = res.match(/ /g).length;

  return numWhitespace === 0 ? 4 : numWhitespace;
}
