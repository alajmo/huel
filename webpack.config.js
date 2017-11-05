const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = config;

function config({ entry, output, port = 3000, webpack }) {
  const ENV = process.env.npm_lifecycle_event;
  const isDev = ENV === 'start';

  return {
    devtool: isDev ? 'cheap-eval-source-map' : 'source-map',

    entry: {
      app: [path.resolve(__dirname, entry)]
    },

    output: {
      path: path.resolve(__dirname, output),
      filename: '[hash].index.js',
      publicPath: '/'
    },

    module: {
      rules: [
        {
          test: /\.html$/,
          use: 'html-loader'
        },
        {
          test: /\.(png|jpg|gif|svg)$/,
          use: 'file-loader?name=img/[name].[ext]'
        },
        {
          test: /.*\.js/,
          use: ['babel-loader']
        },
        {
          test: /\.css$/,
          use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: ['css-loader', 'postcss-loader']
          })
        }
      ]
    },

    plugins: [
      new CleanWebpackPlugin([path.resolve(output)]),
      new UglifyJSPlugin({
        sourceMap: true
      }),
      new HtmlWebpackPlugin({ template: 'example/src/index.html' }),
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
      modules: [path.resolve(__dirname, path.dirname(entry)), 'node_modules']
    }
  };
}
