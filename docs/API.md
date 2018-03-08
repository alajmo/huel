# API

## General Specifications

* Ask before overriding files

## Init

### Specifications

## Build

Compile project and generate dist bundle. Generates manifest.json as well.

### Specifications

* User has to opt in for manifest.json generation

## Tests

### Node Version Check

Affirm that the Node executable satisfied the Node version found in the corresponding package.json file.

### 3rd Party Packages Node Version Check

Affirm that the Node executable satisfied the Node version found in the corresponding package.json file.

### npm-check

> Check for outdated, incorrect, and unused dependencies.

### check-dependencies

> Checks if currently installed npm dependencies are installed in the exact same versions that are specified in package.json

### husky

Add git hooks https://www.npmjs.com/package/husky

### pkg-ok

Hooks to check package.json validity before publishing

### depcheck (depcheck)

> Depcheck is a tool for analyzing the dependencies in a project to see: how each dependency is used, which dependencies are useless, and which dependencies are missing from package.json.

* Unused dependencies
* Unused devDependencies
* Missing dependencies

### package-json-validator (pjv)

> This tool verifies the package.json against the specification of your choice, letting you know if you have a valid file. The validation reports required fields that you MUST have, warns for fields that you SHOULD have, and recommends optional fields that you COULD have.

### size-limit (size-limit)

Check size limits of dist files.
