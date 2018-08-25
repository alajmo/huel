const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Jarvis = require('webpack-jarvis');
const ManifestPlugin = require('webpack-manifest-plugin');
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const fs = require('fs');
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
    mode: 'production',

    devtool: 'source-map',

    entry: {
      app: [path.resolve(options.entry)]
    },

    output: {
      path: outputDir,
      filename: `[hash].${outputFilename}.js`,
      publicPath: '/'
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
          use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [
              { loader: 'css-loader', options: { importLoaders: 1 } },
              {
                loader: 'postcss-loader',
                options: {
                  config: { path: path.resolve(__dirname, 'postcss.config.js') }
                }
              }
            ]
          })
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
    new UglifyJSPlugin({
      sourceMap: true
    }),

    new HtmlWebpackPlugin({
      template: options.template,
      minify: {
        collapseWhitespace: true,
        collapseInlineTagWhitespace: true,
        caseSensitive: true,
        html5: true,
        minifyCSS: true,
        minifyJS: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeEmptyAttributes: true,
        sortAttributes: true,
        sortClassName: true
      }
    }),

    new ExtractTextPlugin({
      filename: `[hash].${options.outputFilename}.css`,
      allChunks: true
    }),

    new CleanWebpackPlugin([options.outputDir], {
      root: process.cwd()
    }),

    new CopyWebpackPlugin(
      Array.isArray(options.copyFiles)
        ? options.copyFiles.map(file => ({ from: file }))
        : []
    )
  ];

  if (options.manifestPath && fs.existsSync(options.manifestPath)) {
    plugins.push(
      new ManifestPlugin({
        seed: Object.assign({}, require(options.manifestPath))
      })
    );
  }

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
