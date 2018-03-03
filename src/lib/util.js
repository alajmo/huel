module.exports = {
  getResolvedAliases
};

function getResolvedAliases(src) {
  const { lstatSync, readdirSync } = require('fs');
  const { join, basename } = require('path');

  const isDirectory = source => lstatSync(source).isDirectory();
  const getDirectories = source =>
    readdirSync(source)
      .map(name => join(source, name))
      .filter(isDirectory);

  const directories = getDirectories(join(process.cwd(), src));

  return Object.assign(
    {},
    ...directories.map(dirPath => {
      return { [basename(dirPath)]: dirPath };
    })
  );
}
