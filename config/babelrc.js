module.exports = 
{
  babelrc: false,
  cacheDirectory: true,
  presets: [require.resolve('babel-preset-env')],
  retainLines: true,
  plugins: [
    require.resolve('babel-plugin-transform-object-rest-spread'),
    [require.resolve('babel-plugin-transform-react-jsx'), { pragma: 'h' }]
  ],
  compact: false,
  comments: true,
  env: {
    development: {
      plugins: []
    }
  }
};
