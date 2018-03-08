const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const fs = require('fs');
const ManifestPlugin = require('webpack-manifest-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
const path = require('path');
const { getResolvedAliases } = require('../src/lib/util.js');

module.exports = config;

function config({ template, entry, output }) {
  const smp = new SpeedMeasurePlugin({ humanVerbose: 'human' });

  const outputDir = path.resolve(output);
  const outputFilename =
    path.extname(output).length === 0 ? 'index' : path.parse(output).name;

  const manifestPath = path.resolve(
    process.cwd(),
    path.dirname(entry),
    'res/manifest.json'
  );

  let manifest = {};
  if (fs.existsSync(manifestPath)) {
    manifest = Object.assign({}, require(manifestPath));
  }

  return smp.wrap({
    mode: 'production',

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

      new ManifestPlugin({
        seed: manifest
      }),

      new CopyWebpackPlugin([
        { from: 'src/res/robots.txt' },
        { from: 'src/res/favicon.ico' }
      ])
    ],

    resolve: {
      alias: getResolvedAliases(path.dirname(entry)),
      modules: ['node_modules']
    }
  });
}
