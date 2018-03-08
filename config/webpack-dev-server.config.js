module.exports = config;

function config({ contentBase, port = 3000 }) {
  return {
    contentBase,
    port,
    clientLogLevel: 'none',
    compress: true,
    filename: 'bundle.js',
    host: 'localhost',
    historyApiFallback: true,
    // inline: true,
    publicPath: '/',
    stats: {
      colors: true,
      hash: false,
      version: false,
      timings: false,
      assets: false,
      chunks: false,
      modules: false,
      reasons: false,
      children: false,
      source: false,
      errors: true,
      errorDetails: false,
      warnings: true
    },
    watchOptions: {
      aggregateTimeout: 0,
      poll: 500
    }
  };
}
