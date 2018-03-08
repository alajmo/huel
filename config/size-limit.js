const defaultConfig = require('./huel.config.json');

module.exports = sizeLimitDefault;

function sizeLimitDefault() {
  return [
    {
      path: `${defaultConfig.output}/*.index.js`,
      webpack: false,
      limit: '100 KB'
    }
  ];
}
