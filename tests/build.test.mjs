import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { assemble, build, stale } from '../scripts/build.mjs';

const lu = (f) => JSON.parse(readFileSync(new URL(`../people/lu/${f}`, import.meta.url), 'utf8'));

// The chart pages are built from src/ and people/ and never edited by hand; a stale page means someone forgot to build.
test('every chart page matches a fresh build', () => {
  assert.deepEqual(stale(build()), [], 'Out of date: run node scripts/build.mjs');
});

test("another person's data fills the page, and the plate follows their strongest element", () => {
  const chart = { ...lu('chart.json'), name: 'Sam', balance: { ...lu('chart.json').balance } };
  chart.balance.elements = [
    ['Fire', 40],
    ['Water', 30],
    ['Earth', 20],
    ['Air', 10],
  ];
  const page = assemble('sam', chart, lu('content.json'));
  assert.match(page, /<html lang="en" data-plate="fire">/);
  assert.match(page, /<title>Sam · Natal Chart<\/title>/);
  assert.doesNotMatch(page, /\{\{/);
});

test('a chart.json with a missing body or a bad position says what to fix', () => {
  const chart = lu('chart.json');
  const planets = { ...chart.planets, Sun: { pos: '20 Pisces', house: 2 } };
  delete planets.Chiron;
  assert.throws(
    () => assemble('sam', { ...chart, planets }, lu('content.json')),
    /planets\.Sun\.pos[\s\S]*planets\.Chiron\.pos/,
  );
});
