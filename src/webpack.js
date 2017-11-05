const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const webpackDevServer = require('webpack-dev-server');

function main() {
  const webpackConfig = require('../webpack.config.js')({
    entry: argv.entry,
    output: argv.output,
    template: argv.template,
    webpack
  });
  const webpackDevServerConfig = require('../webpack-dev-server.config.js')({
    contentBase: path.normalize(argv.output),
    port: argv.port
  });

  if (argv.watch) {
    webpackDevServer.addDevServerEntrypoints(
      webpackConfig,
      webpackDevServerConfig
    );
  }

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

  if (argv.watch) {
    const server = new webpackDevServer(compiler, webpackDevServerConfig);
    server.listen(argv.port, 'localhost', () => {
      console.log(`Listening on http://localhost:${argv.port}`);
    });
  }
}
main();
