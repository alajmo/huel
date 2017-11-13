const path = require('path');
const fs = require('fs');
const glob = require('glob');
const chokidar = require('chokidar');
const prettier = require('prettier');

module.exports = startFormat;

function startFormat({ src, watch }) {
  const normalizedSrc = path.resolve(path.normalize(src));

  if (watch) {
    format({ src: normalizedSrc, watch });
    watchFormat(normalizedSrc);
  } else {
    format({ src: normalizedSrc, watch });
  }
}

function format({ src, watch }) {
  const jsFiles = glob.sync(`${formatPath(src)}/**/*.js`);
  const jsonFiles = glob.sync(`${formatPath(src)}/**/*.json`);
  const cssFiles = glob.sync(`${formatPath(src)}/**/*.css`);

  const prettierConfig = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '../.prettierrc'), 'utf8')
  );
  jsFiles.forEach(filepath => {
    const text = fs.readFileSync(filepath, 'utf8');
    const formatted = prettier.format(text, prettierConfig);
    fs.writeFileSync(filepath, formatted);
  });

  const prettierJSONConfig = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '../.json.prettierrc'), 'utf8')
  );
  jsonFiles.forEach(filepath => {
    const text = fs.readFileSync(filepath, 'utf8');
    const formatted = prettier.format(text, prettierJSONConfig);
    fs.writeFileSync(filepath, formatted);
  });

  const prettierCSSConfig = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '../.css.prettierrc'), 'utf8')
  );
  cssFiles.forEach(filepath => {
    const text = fs.readFileSync(filepath, 'utf8');
    const formatted = prettier.format(text, prettierCSSConfig);
    fs.writeFileSync(filepath, formatted);
  });

  console.log('Code has been formatted with prettier.');
}

function formatFile(filepath) {
  if (path.extname(filepath) === '.js') {
    const prettierConfig = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, '../.prettierrc'), 'utf8')
    );

    const text = fs.readFileSync(filepath, 'utf8');
    const formatted = prettier.format(text, prettierConfig);
    fs.writeFileSync(filepath, formatted);
  } else if (path.extname(filepath) === '.json') {
    const prettierJSONConfig = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, '../.json.prettierrc'), 'utf8')
    );

    const text = fs.readFileSync(filepath, 'utf8');
    const formatted = prettier.format(text, prettierJSONConfig);
    fs.writeFileSync(filepath, formatted);
  } else if (path.extname(filepath) === '.css') {
    const prettierCSSConfig = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, '../.css.prettierrc'), 'utf8')
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
      console.log(`Formatted ${filepath}`);
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
