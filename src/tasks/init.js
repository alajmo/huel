// TODO: Big refactor needed.
//
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const promisify = require('util').promisify;
const defaultConfig = require('../../config/huel.config.json');
const child = require('child_process');

const stat = promisify(fs.stat);
const mkdir = promisify(fs.mkdir);
const copyFile = promisify(fs.copyFile);

module.exports = startInit;

async function startInit({
  all,
  favicon,
  robots,
  manifest,
  templates,
  dryRun,
  scripts,
  gitHooks,
  miscKeys
}) {
  if (miscKeys || all) {
    addMiscKeys(dryRun);
  }

  if (favicon || all) {
    addFavicon(dryRun);
  }

  if (robots || all) {
    addRobots(dryRun);
  }

  if (manifest || all) {
    addManifest(dryRun);
  }

  if (scripts || all) {
    addScripts(dryRun);
  }

  if (gitHooks || all) {
    addHusky();
  }

  if (templates || all) {
    await addGithubTemplates(dryRun);
  }
}

/** Add miscellaneous keys such as engine */
function addMiscKeys(dryRun) {
  const pkgPath = path.join(process.cwd(), 'package.json');
  const numWhitespace = calcWhitespace(fs.readFileSync(pkgPath, 'utf-8'));

  const pkg = Object.assign(require(pkgPath), {
    engines: {
      node: `>=${defaultConfig.minimumNodeVersion}`,
      npm: `>=${defaultConfig.minimumNpmVersion}`
    }
  });

  if (!dryRun) {
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, numWhitespace));
  }

  console.log(
    `Added following keys to ${chalk.bold('package.json')}:

${chalk.green('✔︎')} Minimum node engine requirement
${JSON.stringify({ engines: { node: '>=8' } }, null, 4)}

${chalk.green('✔︎')} Minimum npm engine requirement
${JSON.stringify({ engines: { npm: '>=5' } }, null, 4)}`
  );
}

/** Add miscellaneous scripts */
function addScripts(dryRun) {
  const pkgPath = path.join(process.cwd(), 'package.json');
  const numWhitespace = calcWhitespace(fs.readFileSync(pkgPath, 'utf-8'));
  const [pkg, gitHooks] = addGitHooks(require(pkgPath));
  if (!dryRun) {
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, numWhitespace));
  }
  console.log(`${chalk.green('Following scripts added to package.json:')}
  ${JSON.stringify(gitHooks, null, 4)}
  `);
}

async function addFavicon(dryRun) {
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
      if (!dryRun) {
        await mkdir(resPath);
      }
      console.log(`${chalk.green('✔︎')} Created directory ${resPath}\n`);
    }
  }

  // Copy files to src/res directory
  await files.forEach(async template => {
    const dest = path.join(resPath, path.parse(template).base);
    try {
      if (!dryRun) {
        await copyFile(template, dest);
      }
      console.log(`${chalk.green('✔︎')} generated ${chalk.bold(dest)} `);
    } catch (e) {
      console.error(e);
    }
  });
}

async function addRobots(dryRun) {
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
      if (!dryRun) {
        await mkdir(resPath);
      }
      console.log(`${chalk.green('✔︎')} Created directory ${resPath}\n`);
    }
  }

  // Copy files to src/res directory
  await files.forEach(async template => {
    const dest = path.join(resPath, path.parse(template).base);
    try {
      if (dryRun) {
        await copyFile(template, dest);
      }
      console.log(`${chalk.green('✔︎')} Created directory ${resPath}\n`);
    } catch (e) {
      console.error(e);
    }
  });
}

async function addManifest(dryRun) {
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
      if (!dryRun) {
        await mkdir(resPath);
      }
      console.log(`${chalk.green('✔︎')} Created directory ${resPath}\n`);
    }
  }

  // Copy files to src/res directory
  await files.forEach(async template => {
    const dest = path.join(resPath, path.parse(template).base);
    try {
      if (!dryRun) {
        await copyFile(template, dest);
      }
      console.log(`${chalk.green('✔︎')} generated ${chalk.bold(dest)} `);
    } catch (e) {
      console.error(e);
    }
  });
}

/** Adds documentation templates such as CONTRIBUTING.md */
async function addGithubTemplates(dryRun) {
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
      if (!dryRun) {
        await mkdir(docsPath);
      }
      console.log(`${chalk.green('✔︎')} Created directory ${docsPath}\n`);
    }
  }

  // Copy templates to docs directory
  await templates.forEach(async template => {
    const dest = path.join(docsPath, path.parse(template).base);
    try {
      if (!dryRun) {
        await copyFile(template, dest);
      }
      console.log(`${chalk.green('✔︎')} generated ${chalk.bold(dest)} `);
    } catch (e) {
      console.error(e);
    }
  });
}

/** Add github hooks and development scripts to package.json */
function addGitHooks(pkg) {
  const gitHooks = {
    start:
      'huel build --env development --debug -w -p 1337 -t test/examples/app/src/index.html -e test/examples/app/src/index.js -o test/examples/app/dist/',
    'start-prod':
      'huel build --env production --debug -w -p 1337 -t test/examples/app/src/index.html -e test/examples/app/src/index.js -o test/examples/app/dist/',
    build:
      'huel build --env production -t test/examples/app/src/index.html -e test/examples/app/src/index.js -o test/examples/app/dist/',
    'build-debug':
      'huel build --env production --debug -t test/examples/app/src/index.html -e test/examples/app/src/index.js -o test/examples/app/dist/',
    lint: 'huel lint --src src',
    'lint-watch': 'huel lint -w',
    format: 'huel format --src src',
    'format-watch': 'huel format -w',
    commitlint: 'huel commitmsg',
    test: 'huel test --all',
    changelog:
      'huel changelog && git add CHANGELOG.md && git commit -m "chore: update changelog"'
  };
  return [
    Object.assign(pkg, {
      scripts: Object.assign({}, pkg.scripts, gitHooks)
    }),
    gitHooks
  ];
}

function addHusky(dryRun) {
  console.log('Running: npm install husky@next --save-dev');
  if (dryRun) {
    child.execSync('npm install husky@next --save-dev', {
      encoding: 'utf-8'
    });
  }

  const pkgPath = path.join(process.cwd(), 'package.json');
  const numWhitespace = calcWhitespace(fs.readFileSync(pkgPath, 'utf-8'));

  const huskyHooks = {
    husky: {
      hooks: {
        'pre-commit': 'npm run format',
        'pre-push': 'npm test',
        'pre-publish': 'npm test',
        'commit-msg': 'npm run commitlint'
      }
    }
  };

  const pkg = Object.assign(require(pkgPath), Object.assign({}, huskyHooks));

  if (!dryRun) {
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, numWhitespace));
  }
  console.log(`${chalk.green('Following scripts added to package.json:')}
  ${JSON.stringify(huskyHooks, null, 4)}
  `);
}

/** Calculate whitespace given a json file */
function calcWhitespace(str) {
  let strRemovedNewline = str.replace(/\n/g, '');
  let res = /{[ \t]+\"/.exec(strRemovedNewline)[0];
  let numWhitespace = res.match(/ /g).length;

  return numWhitespace === 0 ? 4 : numWhitespace;
}
