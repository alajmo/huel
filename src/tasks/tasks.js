const build = require('./build.js');
const startFormat = require('./format.js');
const startLint = require('./lint.js');
const startTest = require('./test.js');
const startInit = require('./init.js');
const sizeLimit = require('./size-limit.js');
const commitmsg = require('./lint-commit.js');
const generateChangelog = require('./changelog.js');

const TASKS = Object.freeze({
  build: ({ lint, format, env, template, entry, output, port, watch }) => {
    if (lint) {
      startLint({ src: lint, watch: false });
    }
    if (format) {
      startFormat({ src: format, watch: false });
    }

    if (watch) {
      build.dev({ env, port, entry, template, output });
    } else {
      build.build({ env, entry, template, output, port, watch });
    }
  },

  format: ({ src, watch }) => startFormat({ src, watch }),

  lint: ({ src, watch }) => startLint({ src, watch }),

  test: ({
    verbose,
    all,
    pjv,
    size,
    depcheck,
    nodecheck,
    npmcheck,
    moduleversioncheck,
    modulenodecheck,
    entry,
    extraneousmodules,
    updatecheck,
    ignoreDirs,
    strictversion
  }) =>
    startTest({
      verbose,
      all,
      pjv,
      size,
      depcheck,
      nodecheck,
      npmcheck,
      moduleversioncheck,
      modulenodecheck,
      entry,
      updatecheck,
      extraneousmodules,
      ignoreDirs,
      strictversion
    }),

  startCommitmsg: () => commitmsg(),

  changelog: ({ filename }) => generateChangelog({ filename }),

  init: async ({ templates, scripts, miscKeys }) =>
    await startInit({ templates, scripts, miscKeys }),

  startSizeLimit: ({ dest }) => sizeLimit(dest)
});

module.exports = TASKS;
