const webpack = require('webpack');
const webpackConfig = require('./webpack.test.config.js')({ webpack });

module.exports = config => {
  config.set({
    basePath: '',

    plugins: [
      require('karma-chrome-launcher'),
      require('karma-tap'),
      require('karma-webpack')
    ],

    frameworks: ['tap'],

    files: ['example/test/*.js'],

    exclude: [],

    preprocessors: {
      'example/test/*.js': ['webpack']
    },

    webpack: require('./webpack.dev.config.js'),
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],

    port: 9876,

    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    autoWatch: true,

    browsers: ['ChromeHeadless'],

    singleRun: true,

    concurrency: Infinity
  });
};
