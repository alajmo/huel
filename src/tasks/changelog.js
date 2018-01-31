const path = require('path');
const fs = require('fs');
const conventionalChangelog = require('conventional-changelog');

module.exports = generateConfig;

function generateConfig({ filename }) {
  const filepath = path.join(process.cwd(), filename);
  const config = require('conventional-changelog-angular');

  conventionalChangelog({ config })
    .on('error', e => {
      console.error(e);
      process.exit(1);
    })
    .on('data', data => {
    fs.writeFileSync(filepath, data.toString());
  });
}
