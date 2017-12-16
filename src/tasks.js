const build = require('./tasks/build.js');
const path = require('path');
const startFormat = require('./tasks/format.js');
const startLint = require('./tasks/lint.js');
const startTest = require('./tasks/test.js');

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

  make: ({ src, watch }) => startMake(),

  test: ({ src, watch }) => startTest({ src, watch })
});

module.exports = TASKS;
