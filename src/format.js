const path = require('path');
const fs = require('fs');
const glob = require('glob');
const chokidar = require('chokidar');
const prettier = require('prettier');

module.exports = startPrettier;

function startPrettier({ entry, watch }) {
  const jsFiles = glob.sync(`${formatPath(entry)}/**/*.js`);

  console.log(jsFiles);
  return;
  const pretterConfig = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '../.prettierrc'), 'utf8')
  );

  const formatted = prettier.format(text, pretterConfig);

  if (watch) {
    watchPrettier(entry);
  } else {
    runPrettier(entry, watch);
  }
}

function runPrettier(entry, watch) {
  if (!watch) {
    process.exit(1);
  } else {
    console.log('Code is ESLint compliant.');
  }
}

// const text = fs.readFileSync(filePath, 'utf8');
function watchPrettier(entry) {
  chokidar
    .watch([path.join(entry, '**/*.js')], { ignored: /(^|[\/\\])\../ })
    .on('all', (event, path) => {
      lint(entry, true);
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
