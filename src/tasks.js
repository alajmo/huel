const TASKS = Object.freeze({
  // Callback based function call
  someFunction: someParam => () => someFunction(someParam),
  // None-callback based function call
  someSyncFunction: someParam => () => someSyncFunction(someParam)
});

module.exports = TASKS;

function someFunction() {}

function someSyncFunction() {}
