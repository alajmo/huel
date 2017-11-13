const startLint = require('./lint.js');
const startPrettier = require('./format.js');
const path = require('path');
const webpackTask = require('./webpack.js');

const TASKS = Object.freeze({
  build: options => build(options),
  lint: ({ src, watch }) => startLint({ src, watch })
});

module.exports = TASKS;

function build({ lint, prettier, env, template, entry, output, port, watch }) {
  if (lint) {
    startLint({ src: entry, watch });
  }
  if (prettier) {
    startPrettier({ entry, watch });
  }

  if (watch) {
    webpackTask.dev({ env, port, entry, template, output });
  } else {
    webpackTask.build({ env, entry, template, output, port, watch });
  }
}
