const path = require('path');
const chalk = require('chalk');
const webpack = require('webpack');
const webpackDevServer = require('webpack-dev-server');
const webpackFileConfigs = {
  production: '../../config/webpack.prod.config.js',
  development: '../../config/webpack.dev.config.js',
  developmentServer: '../../config/webpack-dev-server.config.js'
};

const TARGETS = {
  production: 'production',
  development: 'development'
};

module.exports = {
  build,
  dev
};

/** Prints environment to the console. */
function printEnvironment(env) {
  const envName =
    env === TARGETS.production
      ? chalk.red.bold('=== PRODUCTION ===')
      : chalk.yellow.bold('=== DEVELOPMENT ===');
  process.stdout.write(`${envName}\n\n`);
}

function build({ debug, env, entry, output, template }) {
  printEnvironment(env);

  const webpackConfigPath =
    env === TARGETS.production
      ? webpackFileConfigs.production
      : webpackFileConfigs.development;

  const webpackConfig = require(webpackConfigPath)({
    webpack,
    debug,
    entry,
    output,
    template
  });

  const compiler = webpack(webpackConfig);

  const webpackHandler = (err, stats) => {
    if (err) {
      console.error(err.stack || err);
      if (err.details) {
        console.error(err.details);
      }

      throw err;
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
      throw info.errors;
    }

    if (stats.hasWarnings()) {
      console.warn(info.warnings);
    }
  };

  debug ? compiler.watch({}, webpackHandler) : compiler.run(webpackHandler);
}

function dev({ debug, env, entry, output, template, port }) {
  const webpackConfigPath =
    env === TARGETS.production
      ? webpackFileConfigs.production
      : webpackFileConfigs.development;

  const webpackConfig = require(webpackConfigPath)({
    debug,
    entry,
    output,
    template
  });

  const webpackDevServerConfig = require(webpackFileConfigs.developmentServer)({
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
