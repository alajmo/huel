const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const WebpackMonitor = require('webpack-monitor');

module.exports = config;

function config({ template, entry, output, port = 3000, webpack }) {
  return {
    devtool: 'cheap-eval-source-map',

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
          test: /\.html$/,
          use: 'html-loader'
        },
        {
          test: /.*\.js/,
          use: ['babel-loader']
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

    plugins: [
      new CleanWebpackPlugin([path.resolve(output)], { root: process.cwd() }),
      new HtmlWebpackPlugin({ template }),
      new ExtractTextPlugin({
        filename: '[hash].index.css',
        allChunks: true
      })
    ],

    resolve: {
      modules: [path.resolve(process.cwd(), entry), 'node_modules']
    }
  };
}
