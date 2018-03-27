const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Jarvis = require('webpack-jarvis');
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
const path = require('path');
const { getResolvedAliases } = require('../src/lib/util.js');

module.exports = config;

function config({ debug, template, entry, output }) {
  const smp = new SpeedMeasurePlugin({ humanVerbose: 'human' });

  const outputDir = path.resolve(output);
  const outputFilename =
    path.extname(output).length === 0 ? 'index' : path.parse(output).name;

  const config = {
    mode: 'none',

    devtool: 'eval',

    entry: {
      app: [path.resolve(entry)]
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
          use: 'css-loader'
        },

        {
          test: /\.(png|jpg|gif|svg)$/,
          use: 'file-loader?name=img/[name].[ext]'
        }
      ]
    },

    plugins: [
      new CleanWebpackPlugin([outputDir], {
        root: process.cwd()
      }),

      new HtmlWebpackPlugin({
        template,
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
      })
    ],

    resolve: {
      alias: getResolvedAliases(path.dirname(entry)),
      modules: ['node_modules']
    }
  };

  if (debug) {
    config.plugins.push(
      new Jarvis({
        port: 1338,
        watchOnly: false
      })
    );
  }

  return debug ? smp.wrap(config) : config;
}
