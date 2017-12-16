const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const webpackDevServer = require('webpack-dev-server');
const webpackFileConfigs = {
  prod: '../../config/webpack.prod.config.js',
  dev: '../../config/webpack.dev.config.js',
  devServer: '../../config/webpack-dev-server.config.js'
};

const TARGETS = {
  prod: 'prod',
  dev: 'dev'
};

module.exports = {
  build,
  dev
};

function build({ env, entry, output, template }) {
  const webpackConfig = require(env === TARGETS.prod
    ? webpackFileConfigs.prod
    : webpackFileConfigs.dev)({
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
        version: true,
        chunks: false,
        chunkModules: false,
        colors: true,
        assets: true,
        cached: false,
        children: false,
        hash: false
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

function dev({ env, entry, output, template, port }) {
  const webpackConfig = require(env === TARGETS.dev
    ? webpackFileConfigs.dev
    : webpackFileConfigs.prod)({
    entry,
    output,
    template,
    webpack
  });
  const webpackDevServerConfig = require(webpackFileConfigs.devServer)({
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
        version: false,
        chunks: false,
        chunkModules: false,
        colors: true,
        assets: true,
        cached: false,
        children: false,
        hash: false
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
