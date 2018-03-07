const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const promisify = require('util').promisify;
const defaultConfig = require('../../config/default.json');

const stat = promisify(fs.stat);
const mkdir = promisify(fs.mkdir);
const copyFile = promisify(fs.copyFile);

module.exports = startInit;

async function startInit({ templates, scripts, miscKeys }) {
  if (miscKeys) {
    addMiscKeys();
  }

  if (scripts) {
    addScripts();
  }

  if (templates) {
    await addGithubTemplates();
  }
}

/** Add miscellaneous keys such as engine */
function addMiscKeys() {
  const pkgPath = path.join(process.cwd(), 'package.json');
  const numWhitespace = calcWhitespace(fs.readFileSync(pkgPath, 'utf-8'));

  const pkg = Object.assign(require(pkgPath), {
    engines: {
      node: `>=${defaultConfig.minimumNodeVersion}`,
      npm: `>=${defaultConfig.minimumNpmVersion}`
    }
  });

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, numWhitespace));

  console.log(
    `Added following keys to ${chalk.bold('package.json')}:

${chalk.green('✔︎')} Minimum node engine requirement
${JSON.stringify({ engines: { node: '>=8' } }, null, 4)}

${chalk.green('✔︎')} Minimum npm engine requirement
${JSON.stringify({ engines: { npm: '>=5' } }, null, 4)}`
  );
}

/** Add miscellaneous scripts */
function addScripts() {
  const pkgPath = path.join(process.cwd(), 'package.json');
  const numWhitespace = calcWhitespace(fs.readFileSync(pkgPath, 'utf-8'));
  const pkg = addGitHooks(require(pkgPath));
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, numWhitespace));
  console.log(chalk.green('Git commit hooks added'));
}

/** Adds documentation templates such as CONTRIBUTING.md */
async function addGithubTemplates() {
  const templateRoot = path.resolve(__dirname, '../res/github');
  const templates = [
    'CONTRIBUTING.md',
    'ISSUE_TEMPLATE.md',
    'PULL_REQUEST_TEMPLATE.md'
  ].map(template => path.join(templateRoot, template));

  // Create directory docs
  const docsPath = path.join(process.cwd(), 'docs');
  try {
    const docsStat = await stat(docsPath);
    if (docsStat.isFile()) {
      console.error(`${chalk.bold(docsPath)} is a file, expected directory.`);
      process.exit(1);
    }
  } catch (e) {
    if (e.code === 'ENOENT') {
      await mkdir(docsPath);
      console.log(`${chalk.green('✔︎')} Created directory ${docsPath}\n`);
    }
  }

  // Copy templates to docs directory
  await templates.forEach(async template => {
    try {
      await copyFile(template, path.join(docsPath, path.parse(template).base));
      console.log(
        `${chalk.green('✔︎')}  Added template ${chalk.bold(
          path.parse(template).base
        )}`
      );
    } catch (e) {
      console.error(e);
    }
  });
}

/** Add github hooks and development scripts to package.json */
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

/** Calculate whitespace given a json file */
function calcWhitespace(str) {
  let strRemovedNewline = str.replace(/\n/g, '');
  let res = /{[ \t]+\"/.exec(strRemovedNewline)[0];
  let numWhitespace = res.match(/ /g).length;

  return numWhitespace === 0 ? 4 : numWhitespace;
}
