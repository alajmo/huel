# Huel

## Synopsis

A highly opinionated build and development tool for the web. A wonderful concatenation
of the following tools:

* webpack - module bundler
* babel - write next-gen javascript
* prettier - formats your code
* eslint - lints your code
* postcss - write next-gen css

, hidden behind a minimalistic command-line-interface (CLI).

## Requirements

* Node > 8

## Usage

```bash
  Usage: huel [options] [command]

  Development and build environment for the web

  Options:

    -V, --version  output the version number
    -h, --help     output usage information

  Commands:

    build|b        build project
    format|f       format files
    lint|l         lint files
    test|t         test code
    commitmsg|c    assert commit message is in conventional commit form
    changelog      generate changelog
    init|i         bootstrap project
    info|j         info about configs and modules
    help [cmd]     display help for [cmd]

  Examples:

    Build project
    $ huel build --lint src --format src -t src/index.html -e src/index.js -o dist/

    Lint files
    $ huel lint -s src/

    Format files
    $ huel format -s src/

    Run test suite
    $ huel test -s src/
```

## Development

Follows [Conventional Commits](https://conventionalcommits.org/).
