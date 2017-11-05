const path = require('path');

module.exports = config;

function config({ entry, output, port, webpack }) {
  const ENV = process.env.npm_lifecycle_event;
  const isDev = ENV === 'dev';

  return {
    devtool: isDev ? 'eval' : 'source-map',

    entry: {
      app: ['whatwg-fetch', 'babel-polyfill', path.resolve(__dirname, entry)]
    },

    output: {
      path: path.resolve(__dirname, output),
      filename: '[chunkhash].app.js',
      publicPath: '/'
    },

    module: {
      rules: [
        {
          test: /\.html$/,
          use: 'html-loader'
        },
        {
          test: /\.(png|jpg)$/,
          use: 'file-loader?name=img/[name].[ext]'
        },
        {
          test: /.*\.js/,
          use: ['babel-loader']
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader', 'postcss-loader']
        }
      ]
    },

    devtool: 'inline-source-map',

    devServer: {
      clientLogLevel: 'info',
      compress: true,
      contentBase: path.dirname(output),
      filename: 'bundle.js',
      historyApiFallback: true,
      inline: true,
      port: 1337,
      publicPath: '/',
      stats: { colors: true },
      watchOptions: {
        aggregateTimeout: 0,
        poll: 500
      }
    },

    plugins: [
      new webpack.optimize.UglifyJsPlugin({
        compress: { drop_console: true },
        compressor: { warnings: false },
        include: /\.min\.js$/,
        minimize: true,
        sourceMap: true
      })
    ],

    resolve: {
      modules: [path.resolve(__dirname, path.dirname(entry)), 'node_modules']
    }
  };
}
