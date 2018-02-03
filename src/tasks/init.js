const chalk = require('chalk');

module.exports = startInit;

function startInit() {
  const pkgPath = path.join(process.cwd(), 'package.json');
  const numWhitespace = calcWhitespace(fs.readFileSync(pkgPath, 'utf-8'));
  const pkg = addGitHooks(require(pkgPath));
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, numWhitespace));

  console.log(chalk.green('Git commit hooks added'));
}

function addGitHooks(pkg) {
  return Object.assign(pkg, {
    scripts: Object.assign({}, pkg.scripts, {
      'start-prod':
        'hal build -w -t src/index.html -e src/index.js -o dist/ --env prod',
      'start-dev':
        'hal build -w -t src/index.html -e src/index.js -o dist/ --env sandbox',
      'build-dev':
        'hal build --lint src --format src -t src/index.html -e src/index.js -o dist/',
      'build-prod':
        'hal build --lint src --format src -t src/index.html -e src/index.js -o dist/',
      lint: 'hal lint',
      format: 'hal format',
      test: 'hal test --pjv --size --depcheck',
      depcheck: 'hal test --depcheck',
      size: 'hal test --size',
      pjv: 'hal test --pjv',
      precommit: 'npm run format',
      prepush: 'npm test',
      commitmsg: 'hal commitmsg',
      version:
        'conventional-changelog -p angular -i CHANGELOG.md -s -r 0 && git add CHANGELOG.md'
    })
  });
}

function calcWhitespace(str) {
  let strRemovedNewline = str.replace(/\n/g, '');
  let res = /{[ \t]+\"/.exec(strRemovedNewline)[0];
  let numWhitespace = res.match(/ /g).length;

  return numWhitespace === 0 ? 4 : numWhitespace;
}
