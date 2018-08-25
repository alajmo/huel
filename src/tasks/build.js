const chalk = require('chalk');
const webpack = require('webpack');
const serve = require('webpack-serve');
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

function build(options) {
  printEnvironment(options.env);

  const webpackConfigPath = getWebpackConfig(options);
  const webpackConfig = require(webpackConfigPath)(options);
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

  options.debug
    ? compiler.watch({}, webpackHandler)
    : compiler.run(webpackHandler);
}

function dev(options) {
  const webpackConfigPath = getWebpackConfig(options);
  const webpackConfig = require(webpackConfigPath)(options);

  serve(
    { port: options.port },
    {
      add: app => {
        const send = require('koa-send');
        const serve = require('koa-static');
        app.use(serve(options.output));
        app.use(async ctx => {
          await send(ctx, 'index.html', {
            root: options.output
          });
        });
      },
      config: webpackConfig,
      devMiddleware: { writeToDisk: true },
      hotClient: { logLevel: 'warn' }
    }
  ).then(() => console.log(`Listening on http://localhost:${options.port}`));
}

function getWebpackConfig({ env }) {
  return env === TARGETS.production
    ? webpackFileConfigs.production
    : webpackFileConfigs.development;
}
