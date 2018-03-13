# Huel

A highly opinionated build and development tool for web projects.

## Table of Contents

* [Features](#features)
* [Motivation](#motivation)
* [Requirements](#requirements)
* [Get Started](#get-started)
  - [Install](#install)
  - [Usage](#usage)
    + [Production build](#production-build)
    + [Development server](#development-server)
    + [Package Tests](#package-tests)
    + [NOTE](#note)
* [Useful Resources](#useful-resources)
* [Contributing](#contributing)

## Features

A concatenation of the following tools, hidden behind a minimalistic command-line-interface:

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

When you rely on microservice architecture or merely deploy multiple similar web projects, you find yourself replicating a lot of mundane work, and that's where Huel comes in. It allows you to hide all the configuration files and scripts behind a few commands defined in your `package.json` file. There's also a `huel init` command which bootstraps your project with various build and development scripts and also adds commitlint, a git hook which lints your commits.

## Requirements

* Node > 8

## Get Started

### Install

```sh
npm install --save-dev huel
```

### Usage

#### Production build

```bash
huel build --template src/index.html --entry src/index.js --output dist/
```

#### Development server

```bash
huel build --env development --debug -w --port 1337 --template src/index.html --entry src/index.js --output dist/
```

#### Package Tests

```bash
huel test --all --verbose
```

#### NOTE

You have to stand in the root directory of your application, the same directory as your `package.json` for any of the commands to work.

## Useful Resources

* [npm-stat, review node modules on npm](https://npm-stat.com/)
* Type `npm view <module-name>` to see general information about a module
* [The Twelve-Factor App, a methodology for building software-as-a-service apps](https://12factor.net/)

## Contributing

Follows [Conventional Commits](https://conventionalcommits.org/).
