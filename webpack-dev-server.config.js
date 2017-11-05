module.exports = config;

function config({ contentBase, port = 3000 }) {
  return {
    contentBase,
    port,
    clientLogLevel: 'none', // 'info',
    compress: true,
    filename: 'bundle.js',
    host: 'localhost',
    historyApiFallback: true,
    inline: true,
    publicPath: '/',
    stats: { colors: true },
    watchOptions: {
      aggregateTimeout: 0,
      poll: 500
    }
  };
}
