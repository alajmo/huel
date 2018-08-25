const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Jarvis = require('webpack-jarvis');
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
const path = require('path');
const { getResolvedAliases } = require('../src/lib/util.js');

module.exports = config;

function config(options) {
  const smp = new SpeedMeasurePlugin({ humanVerbose: 'human' });

  const outputDir = path.resolve(options.output);
  const outputFilename =
    path.extname(options.output).length === 0
      ? 'index'
      : path.parse(options.output).name;

  const config = {
    mode: 'none',

    devtool: 'eval',

    entry: {
      app: [path.resolve(options.entry)]
    },

    output: {
      path: outputDir,
      filename: `${outputFilename}.js`,
      publicPath: '/',
      pathinfo: true
    },

    optimization: {
      namedChunks: true,
      nodeEnv: 'development',
      minimize: false,
      splitChunks: {
        chunks: 'all'
      }
    },

    resolveLoader: {
      modules: [
        path.resolve(__dirname, '../node_modules'),
        path.resolve(__dirname, '../../')
      ]
    },

    module: {
      rules: [
        {
          test: /\.html$/,
          use: 'html-loader'
        },

        {
          test: /.*\.js/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: require('./babelrc.js')
          }
        },

        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        },

        {
          test: /\.(png|jpg|gif|svg)$/,
          use: 'file-loader?name=img/[name].[ext]'
        }
      ]
    },

    resolve: {
      alias: getResolvedAliases(path.dirname(options.entry)),
      modules: ['node_modules']
    }
  };

  config.plugins = webpackPlugins({ ...options, outputFilename, outputDir });

  return options.debug ? smp.wrap(config) : config;
}

function webpackPlugins(options) {
  const plugins = [
    new CleanWebpackPlugin([options.outputDir], {
      root: process.cwd()
    }),

    new HtmlWebpackPlugin({
      template: options.template,
      collapseWhitespace: false,
      cache: true,
      collapseInlineTagWhitespace: false,
      caseSensitive: false,
      minifyCSS: false,
      minifyJS: false,
      removeComments: false,
      removeRedundantAttributes: false,
      removeEmptyAttributes: false,
      sortAttributes: false,
      sortClassName: false
    }),

    new CopyWebpackPlugin(
      Array.isArray(options.copyFiles)
        ? options.copyFiles.map(file => ({ from: file }))
        : []
    )
  ];

  if (options.debug) {
    plugins.push(
      new Jarvis({
        port: 1338,
        watchOnly: false
      })
    );
  }

  return plugins;
}
