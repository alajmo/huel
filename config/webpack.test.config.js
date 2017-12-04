const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const path = require('path');

module.exports = config;

function config({ entry, output, webpack }) {
  return {
    devtool: 'source-map',

    entry: {
      app: [path.resolve(entry)]
    },

    output: {
      path: path.resolve(output),
      filename: '[hash].index.js',
      publicPath: '/'
    },

    resolveLoader: {
      modules: [path.resolve(__dirname, 'node_modules')]
    },

    module: {
      rules: [
        {
          test: /.*\.js/,
          exclude: /node_modules/,
          use: ['babel-loader']
        }
      ]
    },

    plugins: [
      new CleanWebpackPlugin([path.resolve(output)], { root: process.cwd() })
    ],

    resolve: {
      modules: [
        path.resolve(process.cwd(), path.dirname(entry)),
        'node_modules'
      ]
    }
  };
}
