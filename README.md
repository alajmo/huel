# HAL

> Developer: Hello, HAL. Do you read me, HAL? <br>
> HAL: Affirmative, Dave. I read you.

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
  Usage: hal [options] [command]

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
    $ hal build --lint src --format src -t src/index.html -e src/index.js -o dist/

    Lint files
    $ hal lint -s src/

    Format files
    $ hal format -s src/

    Run test suite
    $ hal test -s src/
```

## Development

Follows [Conventional Commits](https://conventionalcommits.org/).
