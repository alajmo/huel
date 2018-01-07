// format function copied from https://github.com/marionebl/commitlint/blob/c98cd787d1c45060d1dc1c8076790e33d6e5324c/%40commitlint/core/src/format.js

const chalk = require('chalk');
const { lint, load, read } = require('@commitlint/core');

const DEFAULT_SIGNS = [' ', '⚠', '✖'];
const DEFAULT_COLORS = ['white', 'yellow', 'red'];

const CONFIG = {
  extends: ['@commitlint/config-angular']
};

module.exports = commitmsg;

function commitmsg() {
  Promise.all([load(CONFIG), read({ from: 'HEAD~1' })])
    .then(tasks => {
      const [{ rules, parserPreset }, [commit]] = tasks;
      return lint(
        commit,
        rules,
        parserPreset ? { parserOpts: parserPreset.parserOpts } : {}
      );
    })
    .then(report => {
      if (!report.valid) {
        const problems = format(report);
        problems.forEach(elem => {
          console.log(elem);
        });
      }
    });
}

function format(report = {}, options = {}) {
  const {
    signs = DEFAULT_SIGNS,
    colors = DEFAULT_COLORS,
    color: enabled = true
  } = options;
  const { errors = [], warnings = [] } = report;

  const problems = [...errors, ...warnings].map(problem => {
    const sign = signs[problem.level] || '';
    const color = colors[problem.level] || 'white';
    const decoration = enabled ? chalk[color](sign) : sign;
    const name = enabled
      ? chalk.grey(`[${problem.name}]`)
      : `[${problem.name}]`;
    return `${decoration}   ${problem.message} ${name}`;
  });

  const sign = selectSign({ errors, warnings });
  const color = selectColor({ errors, warnings });

  const decoration = enabled ? chalk[color](sign) : sign;
  const summary = `${decoration}   found ${errors.length} problems, ${
    warnings.length
  } warnings`;
  return [...problems, enabled ? chalk.bold(summary) : summary];
}

function selectSign(report) {
  if (report.errors.length > 0) {
    return '✖';
  }
  return report.warnings.length ? '⚠' : '✔';
}

function selectColor(report) {
  if (report.errors.length > 0) {
    return 'red';
  }
  return report.warnings.length ? 'yellow' : 'green';
}