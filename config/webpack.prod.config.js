const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Jarvis = require('webpack-jarvis');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const path = require('path');

module.exports = config;

function config({ template, entry, output, webpack }) {
  const outputDir = path.resolve(output);
  const outputFilename =
    path.extname(output).length === 0 ? 'index.js' : path.parse(output).name;

  return {
    devtool: 'source-map',

    entry: {
      app: [path.resolve(entry)]
    },

    output: {
      path: outputDir,
      filename: `[hash].${outputFilename}.js`,
      publicPath: '/'
    },

    resolveLoader: {
      modules: [path.resolve(__dirname, '../node_modules')]
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
      new Jarvis({
        port: 1338
      }),

      new CleanWebpackPlugin([outputDir], {
        root: process.cwd()
      }),
      new UglifyJSPlugin({
        sourceMap: true
      }),
      new HtmlWebpackPlugin({
        template,
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
        filename: `[hash].${outputFilename}.css`,
        allChunks: true
      }),
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify('production')
        }
      })
    ],

    resolve: {
      modules: [
        path.resolve(process.cwd(), path.dirname(entry)),
        'node_modules'
      ]
    }
  };
}
