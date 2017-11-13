const path = require('path');
const fs = require('fs');
const glob = require('glob');
const chokidar = require('chokidar');
const prettier = require('prettier');

module.exports = startFormat;

function startFormat({ src, watch }) {
  if (watch) {
    watchFormat(src);
  } else {
    format({ src, watch });
  }
}

function format({ src, watch }) {
  const normalizedSrc = path.resolve(path.normalize(src));

  const jsFiles = glob.sync(`${formatPath(normalizedSrc)}/**/*.js`);
  const jsonFiles = glob.sync(`${formatPath(normalizedSrc)}/**/*.json`);
  const cssFiles = glob.sync(`${formatPath(normalizedSrc)}/**/*.css`);

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

function watchFormat(src) {
  chokidar
    .watch([path.join(src, '**/*.js')], { ignored: /(^|[\/\\])\../ })
    .on('all', (event, path) => {
      format({ src, watch: true });
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
