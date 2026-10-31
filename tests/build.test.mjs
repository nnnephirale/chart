import { test } from 'node:test';
import assert from 'node:assert/strict';
import { build, stale } from '../scripts/build.mjs';

// The chart pages are built from src/ and never edited by hand; a stale page means someone forgot to build.
test('every chart page matches a fresh build of src/', () => {
  assert.deepEqual(stale(build()), [], 'Out of date: run node scripts/build.mjs');
});
