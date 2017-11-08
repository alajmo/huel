const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const webpackDevServer = require('webpack-dev-server');

module.exports = {
  build,
  dev
};

function build({ entry, output, template }) {
  const webpackConfig = require('../webpack.prod.config.js')({
    entry,
    output,
    template,
    webpack
  });

  const compiler = webpack(webpackConfig, (err, stats) => {
    if (err) {
      console.error(err.stack || err);
      if (err.details) {
        console.error(err.details);
      }
      return;
    }

    const info = stats.toJson();

    console.log(
      stats.toString({
        chunks: false,
        colors: true,
        assets: true,
        cached: true
      })
    );

    if (stats.hasErrors()) {
      console.error(info.errors);
    }

    if (stats.hasWarnings()) {
      console.warn(info.warnings);
    }
  });
}

function dev({ entry, output, template, port }) {
  const webpackConfig = require('../webpack.prod.config.js')({
    entry,
    output,
    template,
    webpack
  });
  const webpackDevServerConfig = require('../webpack-dev-server.config.js')({
    contentBase: path.normalize(output),
    port
  });

  webpackDevServer.addDevServerEntrypoints(
    webpackConfig,
    webpackDevServerConfig
  );

  const compiler = webpack(webpackConfig, (err, stats) => {
    if (err) {
      console.error(err.stack || err);
      if (err.details) {
        console.error(err.details);
      }
      return;
    }

    const info = stats.toJson();

    console.log(
      stats.toString({
        chunks: false,
        colors: true,
        assets: true,
        cached: true
      })
    );

    if (stats.hasErrors()) {
      console.error(info.errors);
    }

    if (stats.hasWarnings()) {
      console.warn(info.warnings);
    }
  });

  const server = new webpackDevServer(compiler, webpackDevServerConfig);
  server.listen(port, 'localhost', () => {
    console.log(`Listening on http://localhost:${port}`);
  });
}
