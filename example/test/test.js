// Functional Testing.

import test from 'ava';
import { hello } from '../src/lib.js';

test('foo', t => {
  t.pass();
});

// test('bar', async t => {
//   const bar = Promise.resolve('bar');

//   t.is(await bar, 'bar');
// });

// test('bar', t => {
//   t.is(0, q);
// });
