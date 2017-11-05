const child = require('child_process');

const TASKS = Object.freeze({
  build: options => build(options),
  dev: options => dev(options)
});

module.exports = TASKS;

function dev({ port, entry, output }) {
  console.log('dev');

  child.execSync(
    `node src/webpack.js --watch --port ${port} --entry ${entry} --output ${output}`,
    {
      stdio: [0, 1, 2]
    }
  );
}

function build({ entry, output }) {
  console.log('build');

  child.execSync(`node src/webpack.js --entry ${entry} --output ${output}`, {
    stdio: [0, 1, 2]
  });
}

function changeStartingTime(
  { timer, updateStartingTime },
  { target: { value: startingTime } }
) {
  updateStartingTime({ timer, startingTime });
}
