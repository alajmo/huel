module.exports = {
  babelrc: false,
  cacheDirectory: true,
  retainLines: true,
  compact: false,
  comments: true,
  env: {
    development: {
      plugins: []
    }
  },
  presets: [
    [
      require.resolve('babel-preset-env'),
      {
        targets: {
          node: 'current',
          browsers: ['last 2 versions']
        }
      }
    ]
  ],
  plugins: [
    require.resolve('babel-plugin-transform-object-rest-spread'),
    [require.resolve('babel-plugin-transform-react-jsx'), { pragma: 'h' }],
    [
      require.resolve('babel-plugin-transform-runtime'),
      {
        polyfill: false,
        regenerator: true
      }
    ]
  ]
};
