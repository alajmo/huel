const child = require('child_process');
const del = require('del');
const fs = require('fs');
const path = require('path');
const test = require('tap').test;

main();

function main() {
  simpleTest();
}

function simpleTest() {
  test('Simple test', t => {
    t.end();
  });
}
