const startLint = require('./lint.js');
const startFormat = require('./format.js');
const path = require('path');
const webpackTask = require('./webpack.js');

const TASKS = Object.freeze({
  build: options => build(options),
  lint: ({ src, watch }) => startLint({ src, watch }),
  format: ({ src, watch }) => startFormat({ src, watch })
});

module.exports = TASKS;

function build({ lint, format, env, template, entry, output, port, watch }) {
  if (lint) {
    startLint({ src: lint, watch });
  }
  if (format) {
    startFormat({ src: format, watch });
  }

  if (watch) {
    webpackTask.dev({ env, port, entry, template, output });
  } else {
    webpackTask.build({ env, entry, template, output, port, watch });
  }
}
