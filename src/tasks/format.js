const path = require('path');
const fs = require('fs');
const glob = require('glob');
const chokidar = require('chokidar');
const prettier = require('prettier');
const chalk = require('chalk');

module.exports = startFormat;

const PRETTIERRC = {
  js: path.resolve(__dirname, '../../config/.prettierrc'),
  json: path.resolve(__dirname, '../../config/.json.prettierrc'),
  css: path.resolve(__dirname, '../../config/.css.prettierrc')
};

function startFormat({ src, watch }) {
  const normalizedSrc = path.resolve(path.normalize(src));

  format(normalizedSrc);
  if (watch) {
    console.log(`${chalk.bold('Watching: ')}${normalizedSrc}`);
    watchFormat(normalizedSrc);
  }
}

function format(src) {
  const jsFiles = glob.sync(`${formatPath(src)}/**/*.js`);
  const jsonFiles = glob.sync(`${formatPath(src)}/**/*.json`);
  const cssFiles = glob.sync(`${formatPath(src)}/**/*.css`);

  const prettierConfig = JSON.parse(fs.readFileSync(PRETTIERRC.js, 'utf8'));
  jsFiles.forEach(filepath => {
    const text = fs.readFileSync(filepath, 'utf8');
    const formatted = prettier.format(text, prettierConfig);
    fs.writeFileSync(filepath, formatted);
  });

  const prettierJSONConfig = JSON.parse(
    fs.readFileSync(PRETTIERRC.json, 'utf8')
  );
  jsonFiles.forEach(filepath => {
    const text = fs.readFileSync(filepath, 'utf8');
    try {
      const formatted = prettier.format(text, prettierJSONConfig);
      fs.writeFileSync(filepath, formatted);
    } catch (e) {
      console.error(
        `Failed to parse json file ${chalk.bold(filepath)} with prettier`
      );
      throw e;
    }
  });

  const prettierCSSConfig = JSON.parse(fs.readFileSync(PRETTIERRC.css, 'utf8'));
  cssFiles.forEach(filepath => {
    const text = fs.readFileSync(filepath, 'utf8');
    const formatted = prettier.format(text, prettierCSSConfig);
    fs.writeFileSync(filepath, formatted);
  });

  const successMessage = 'Code has been formatted with prettier.';
  console.log(`${chalk.green(successMessage)}`);
}

function formatFile(filepath) {
  if (path.extname(filepath) === '.js') {
    const prettierConfig = JSON.parse(fs.readFileSync(PRETTIERRC.js, 'utf8'));

    const text = fs.readFileSync(filepath, 'utf8');
    const formatted = prettier.format(text, prettierConfig);
    fs.writeFileSync(filepath, formatted);
  } else if (path.extname(filepath) === '.json') {
    const prettierJSONConfig = JSON.parse(
      fs.readFileSync(PRETTIERRC.json, 'utf8')
    );

    const text = fs.readFileSync(filepath, 'utf8');
    const formatted = prettier.format(text, prettierJSONConfig);
    fs.writeFileSync(filepath, formatted);
  } else if (path.extname(filepath) === '.css') {
    const prettierCSSConfig = JSON.parse(
      fs.readFileSync(PRETTIERRC.css, 'utf8')
    );

    const text = fs.readFileSync(filepath, 'utf8');
    const formatted = prettier.format(text, prettierCSSConfig);
    fs.writeFileSync(filepath, formatted);
  }
}

function watchFormat(src) {
  chokidar
    .watch(
      [
        path.join(src, '**/*.js'),
        path.join(src, '**/*.json'),
        path.join(src, '**/*.css')
      ],
      { ignored: /(^|[\/\\])\../, ignoreInitial: true }
    )
    .on('all', (event, filepath) => {
      formatFile(filepath);
      console.log(`${chalk.green('Formatted file: ')}${filepath}`);
    });
}

function formatPath(p) {
  if (p[0] === '/') {
    // Absolute path.
    return p;
  } else if (p[0] === '.' && p[1] === '/') {
    // Relative path.
    return p;
  } else {
    // Missing ./, this is needed for the glob pattern.
    return `./${p}`;
  }
}
