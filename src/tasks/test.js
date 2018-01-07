const child = require('child_process');
const path = require('path');
const fs = require('fs');
const glob = require('glob');
const chokidar = require('chokidar');
const colors = require('../lib/colors.js');
const PJV = require('package-json-validator').PJV;

module.exports = startTest;

function startTest({ src, watch }) {
  validatePackageJson();
  runTests(src);
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
