const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = config;

function config({ template, entry, output, port = 3000, webpack }) {
  const ENV = process.env.npm_lifecycle_event;
  const isDev = ENV === 'start';

  return {
    devtool: isDev ? 'cheap-eval-source-map' : 'source-map',

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
      new UglifyJSPlugin({
        sourceMap: true
      }),
      new HtmlWebpackPlugin({ template }),
      new ExtractTextPlugin({
        filename: '[hash].index.css',
        allChunks: true
      }),
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify('production')
        }
      }),
      new webpack.optimize.ModuleConcatenationPlugin()
    ],

    resolve: {
      modules: [
        path.resolve(process.cwd(), path.dirname(entry)),
        'node_modules'
      ]
    }
  };
}
