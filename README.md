# Huel

## Synopsis

A highly opinionated build and development tool for the web. A wonderful concatenation
of the following tools, hidden behind a minimalistic command-line-interface:

* [webpack](https://github.com/webpack) - module bundler
* [babel](https://github.com/babel/babel) - write next-gen javascript
* [postcss](https://github.com/postcss/postcss) - write next-gen css
* [prettier](https://github.com/prettier/prettier) - formats your code
* [eslint](https://github.com/eslint/eslint) - lints your code
* [husky](https://github.com/typicode/husky) - add git commit hooks
* [commitlint](https://github.com/marionebl/commitlint) - lint your commit messages
* [conventional-changelog](https://github.com/conventional-changelog/conventional-changelog) - auto generate changelog
* [depcheck](https://github.com/depcheck/depcheck) - sync dependencies between node_modules and package.json and check for unused modules
* [package-json-validator](https://github.com/gorillamania/package.json-validator) - validate package.json
* [size-limit](https://github.com/ai/size-limit) - check size limit
* [check-dependencies](https://github.com/mgol/check-dependencies) check that modules are synced between package.json and package-lock.json
* [jarvis](https://github.com/zouhir/jarvis) - start a browser based Webpack dashboard
* [speed-measure-webpack-plugin](speed-measure-webpack-plugin) - measure time it takes for webpack plugins to run
* validate node and npm versions
* validate that strict versioning is used in package.json for modules

## Motivation

When you rely on microservice architecture or simply deploy multiple similar web projects you find yourself replicating a lot of mundane work and that's where Huel comes in. It allows you to hide all the configuration files and scripts behind a few commands defined in your `package.json` file.

## Requirements

* Node > 8

## Get Started

### Install

```sh
npm install --save-dev huel
```

### Usage

Production build:

```bash
huel build --template src/index.html --entry src/index.js --output dist/
```

Development server:
```bash
huel build --env development --debug -w --port 1337 --template src/index.html --entry src/index.js --output dist/
```

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
    $ huel build --lint src --format src --template src/index.html --entry src/index.js --output dist/

    Lint files
    $ huel lint --src src/

    Format files
    $ huel format --src src/

    Run test suite
    $ huel test --all
```

## Development

Follows [Conventional Commits](https://conventionalcommits.org/).
