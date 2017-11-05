const child = require('child_process');
const path = require('path');

const TASKS = Object.freeze({
  build: options => build(options),
  dev: options => dev(options)
});

module.exports = TASKS;

function dev({ template, port, entry, output }) {
  console.log('dev');
  const webpack = path.join(path.dirname(__filename), 'webpack.js');

  child.execSync(
    `node ${webpack} --watch --port ${port} --template ${template} --entry ${entry} --output ${output}`,
    {
      stdio: [0, 1, 2]
    }
  );
}

function build({ template, entry, output }) {
  console.log('build');
  const webpack = path.join(path.dirname(__filename), 'webpack.js');

  child.execSync(
    `node ${webpack} --template ${template} --entry ${entry} --output ${output}`,
    {
      stdio: [0, 1, 2]
    }
  );
}

function changeStartingTime(
  { timer, updateStartingTime },
  { target: { value: startingTime } }
) {
  updateStartingTime({ timer, startingTime });
}
