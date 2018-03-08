// TODO: Big refactor needed.
//
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const promisify = require('util').promisify;
const defaultConfig = require('../../config/huel.config.json');

const stat = promisify(fs.stat);
const mkdir = promisify(fs.mkdir);
const copyFile = promisify(fs.copyFile);

module.exports = startInit;

async function startInit({
  allInit,
  favicon,
  robots,
  manifest,
  templates,
  scripts,
  miscKeys
}) {
  if (miscKeys || allInit) {
    addMiscKeys();
  }

  if (favicon || allInit) {
    addFavicon();
  }

  if (robots || allInit) {
    addRobots();
  }

  if (manifest || allInit) {
    addManifest();
  }

  if (scripts || allInit) {
    addScripts();
  }

  if (templates || allInit) {
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

async function addFavicon() {
  const resRoot = path.resolve(__dirname, '../res');
  const files = ['favicon.ico'].map(template => path.join(resRoot, template));

  // Create directory docs
  const resPath = path.join(process.cwd(), 'src/res');
  try {
    const resStat = await stat(resPath);
    if (resStat.isFile()) {
      console.error(`${chalk.bold(resPath)} is a file, expected directory.`);
      process.exit(1);
    }
  } catch (e) {
    if (e.code === 'ENOENT') {
      await mkdir(resPath);
      console.log(`${chalk.green('✔︎')} Created directory ${resPath}\n`);
    }
  }

  // Copy files to src/res directory
  await files.forEach(async template => {
    try {
      await copyFile(template, path.join(resPath, path.parse(template).base));
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

async function addRobots() {
  const resRoot = path.resolve(__dirname, '../res');
  const files = ['robots.txt'].map(template => path.join(resRoot, template));

  // Create directory docs
  const resPath = path.join(process.cwd(), 'src/res');
  try {
    const resStat = await stat(resPath);
    if (resStat.isFile()) {
      console.error(`${chalk.bold(resPath)} is a file, expected directory.`);
      process.exit(1);
    }
  } catch (e) {
    if (e.code === 'ENOENT') {
      await mkdir(resPath);
      console.log(`${chalk.green('✔︎')} Created directory ${resPath}\n`);
    }
  }

  // Copy files to src/res directory
  await files.forEach(async template => {
    try {
      await copyFile(template, path.join(resPath, path.parse(template).base));
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

async function addManifest() {
  const resRoot = path.resolve(__dirname, '../res');
  const files = ['manifest.json'].map(template => path.join(resRoot, template));

  // Create directory docs
  const resPath = path.join(process.cwd(), 'src/res');
  try {
    const resStat = await stat(resPath);
    if (resStat.isFile()) {
      console.error(`${chalk.bold(resPath)} is a file, expected directory.`);
      process.exit(1);
    }
  } catch (e) {
    if (e.code === 'ENOENT') {
      await mkdir(resPath);
      console.log(`${chalk.green('✔︎')} Created directory ${resPath}\n`);
    }
  }

  // Copy files to src/res directory
  await files.forEach(async template => {
    try {
      await copyFile(template, path.join(resPath, path.parse(template).base));
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
        'huel build -w -t src/index.html -e src/index.js -o dist/ --env prod',
      'start-dev':
        'huel build -w -t src/index.html -e src/index.js -o dist/ --env sandbox',
      'build-dev':
        'huel build --lint src --format src -t src/index.html -e src/index.js -o dist/',
      'build-prod':
        'huel build --lint src --format src -t src/index.html -e src/index.js -o dist/',
      lint: 'huel lint',
      format: 'huel format',
      test: 'huel test --pjv --size --depcheck',
      depcheck: 'huel test --depcheck',
      size: 'huel test --size',
      pjv: 'huel test --pjv',
      precommit: 'npm run format',
      prepush: 'npm test',
      commitmsg: 'huel commitmsg',
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
