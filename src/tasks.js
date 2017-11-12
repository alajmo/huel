const startLint = require('./lint.js');
const path = require('path');
const webpackTask = require('./webpack.js');

const TASKS = Object.freeze({
  build: options => build(options),
  lint: ({ entry, watch }) => startLint({ entry, watch })
});

module.exports = TASKS;

function build({ lint, env, template, entry, output, port, watch }) {
  if (lint) {
    startLint({ entry, watch });
  }

  if (watch) {
    webpackTask.dev({ env, port, entry, template, output });
  } else {
    webpackTask.build({ env, entry, template, output, port, watch });
  }
}
