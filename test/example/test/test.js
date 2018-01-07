import { functionalTests } from './functional-tests/index.js';

main();
async function main() {
  await unitTests();
  await functionalTests();
}
