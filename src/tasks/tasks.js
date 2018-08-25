const build = require('./build.js');
const format = require('./format.js');
const lint = require('./lint.js');
const test = require('./test.js');
const init = require('./init.js');
const info = require('./info.js');
const commitmsg = require('./lint-commit.js');
const changelog = require('./changelog.js');

const TASKS = Object.freeze({
  build: options => {
    if (options.watch) {
      build.dev(options);
    } else {
      build.build(options);
    }
  },
  format,
  lint,
  test,
  commitmsg,
  changelog,
  async init(options) {
    return await init(options);
  },
  info
});

module.exports = TASKS;
