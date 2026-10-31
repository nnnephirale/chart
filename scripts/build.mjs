// Builds every chart page from the shared engine in src/ and each person's data in people/<name>/.
// No dependencies: node scripts/build.mjs
//
// src/page.html is the page. Its {{slots}} take the person's details from people/<name>/chart.json
// ({{name}}, {{titles.houses}}, ...), {{plate}} takes the chart's strongest element, and {{chart}} and
// {{content}} take the two JSON files whole. Then each `@@ <path>` line is swapped for that file in src/.
// The JS files are not modules: page.html opens one closure, `(() => { 'use strict';`, defines CONTENT
// and CHART, the files run inside it in name order and share its scope, and page.html closes it.
//
// people/lu/ builds the reference page, lu-chart-desktop.html, and index.html (what GitHub Pages serves);
// every other people/<name>/ builds charts/<name>.html. Each is one self-contained .html that opens with
// a double-click.
//
// Never edit an output by hand: the build records each output's sha256 in scripts/.built.json and
// refuses to overwrite a file that has changed since. Move the change into src/ or people/ (see
// ARCHITECTURE.md), or pass --force to discard it.
//
//   node scripts/build.mjs           write every output
//   node scripts/build.mjs --check   exit 1 if any output differs from a fresh build (writes nothing)
//   node scripts/build.mjs --force   overwrite outputs even if they were edited by hand
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = fileURLToPath(new URL('..', import.meta.url));
const src = join(repo, 'src');
const people = join(repo, 'people');
const record = join(repo, 'scripts', '.built.json');

// Where each person's page goes; anyone not listed goes to charts/<name>.html
const OUTPUTS = { lu: ['lu-chart-desktop.html', 'index.html'] };

const SIGN_NAMES =
  'Aries Taurus Gemini Cancer Leo Virgo Libra Scorpio Sagittarius Capricorn Aquarius Pisces'.split(' ');
const ELEMENTS = ['Water', 'Fire', 'Earth', 'Air'];
const MODES = ['Cardinal', 'Fixed', 'Mutable'];
const ASPECT_TYPES = ['conj', 'sex', 'sq', 'tri', 'opp'];
const CONTENT_KEYS = [
  'stories',
  'codes',
  'configs',
  'features',
  'prompts',
  'callouts',
  'intros',
  'notes',
  'cards',
  'pnotes',
];
const POS = /^\d{1,2}(Ari|Tau|Gem|Can|Leo|Vir|Lib|Sco|Sag|Cap|Aqu|Pis)\d\d'(\d\d")?$/;

const sha = (text) => createHash('sha256').update(text).digest('hex');
const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// JSON inside <script>: keep the HTML parser from seeing a closing tag or a comment opener
const inline = (json) => json.replace(/<\/(script)/gi, '<\\/$1').replace(/<!--/g, '\\u003c!--');

// The body names the engine lists, in order, read from BODIES in src/js/03-chart-data.js
function bodyNames() {
  const code = readFileSync(join(src, 'js', '03-chart-data.js'), 'utf8');
  const block = code.match(/const BODIES = \[([\s\S]*?)\n\];/);
  if (!block) throw new Error('src/js/03-chart-data.js: BODIES not found');
  return [...block[1].matchAll(/n: '([^']+)'/g)].map((m) => m[1]);
}

// Everything a chart needs, with messages an agent filling chart.json can act on
function validate(name, chart, content) {
  const errs = [];
  const need = (ok, msg) => ok || errs.push(msg);
  const pairs = (rows, keys, label) =>
    need(
      Array.isArray(rows) && rows.length && rows.every(([k, v]) => keys.includes(k) && typeof v === 'number'),
      `"${label}" needs [name, percent] pairs, names from: ${keys.join(', ')}`,
    );
  for (const k of ['name', 'born', 'place', 'footer'])
    need(typeof chart[k] === 'string' && chart[k], `"${k}" is missing`);
  for (const k of ['houses', 'balance', 'signs']) need(chart.titles?.[k], `"titles.${k}" is missing`);
  need(
    Array.isArray(chart.cusps) && chart.cusps.length === 12 && chart.cusps.every((c) => POS.test(c)),
    `"cusps" needs the 12 house cusps as astro.com prints them, e.g. "1Aqu54'42\\""`,
  );
  const bodies = bodyNames();
  for (const b of bodies) {
    const p = chart.planets?.[b];
    need(p && POS.test(p.pos), `"planets.${b}.pos" needs a position like "20Pis01'27\\""`);
    need(
      p && Number.isInteger(p.house) && p.house >= 1 && p.house <= 12,
      `"planets.${b}.house" needs 1 to 12`,
    );
  }
  for (const b of Object.keys(chart.planets || {}))
    need(bodies.includes(b), `"planets.${b}" isn't a body the page knows`);
  (chart.aspects || []).forEach((x, i) => {
    const [a, b, t, orb, w, s, from] = x;
    need(
      bodies.includes(a) && bodies.includes(b) && a !== 'Lilith' && b !== 'Lilith' && a !== b,
      `aspect ${i + 1}: "${a}" and "${b}" must be two different bodies (not Lilith)`,
    );
    need(ASPECT_TYPES.includes(t), `aspect ${i + 1}: type must be one of ${ASPECT_TYPES.join(', ')}`);
    need(/^\d+°\d\d'$/.test(orb), `aspect ${i + 1}: orb must look like "2°46'"`);
    need(typeof w === 'number' && w >= 0 && w <= 100, `aspect ${i + 1}: strength must be 0 to 100`);
    need(typeof s === 'string' && s, `aspect ${i + 1}: label is missing`);
    need(from === undefined || from === 'calc', `aspect ${i + 1}: the seventh field is "calc" or nothing`);
  });
  need(Array.isArray(chart.aspects) && chart.aspects.length, '"aspects" is missing');
  pairs(chart.power?.planets, [...bodies, 'Ascendant', 'Midheaven'], 'power.planets');
  pairs(chart.power?.houses, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 'power.houses');
  pairs(chart.power?.signs, SIGN_NAMES, 'power.signs');
  pairs(chart.balance?.elements, ELEMENTS, 'balance.elements');
  pairs(chart.balance?.modes, MODES, 'balance.modes');
  for (const k of CONTENT_KEYS) need(content[k], `content.json: "${k}" is missing`);
  if (errs.length) throw new Error(`people/${name}/chart.json:\n  - ${errs.join('\n  - ')}`);
}

// Every person with a chart.json, as [name, chart, content]
export function charts() {
  if (!existsSync(people)) return [];
  return readdirSync(people, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(people, d.name, 'chart.json')))
    .map((d) => {
      const read = (f) => {
        try {
          return JSON.parse(readFileSync(join(people, d.name, f), 'utf8'));
        } catch (e) {
          throw new Error(`people/${d.name}/${f}: ${e.message}`);
        }
      };
      return [d.name, read('chart.json'), read('content.json')];
    });
}

// One person's page
export function assemble(name, chart, content) {
  validate(name, chart, content);
  const top = [...chart.balance.elements].sort((a, b) => b[1] - a[1])[0][0];
  const slots = {
    plate: top.toLowerCase(),
    content: inline(JSON.stringify(content, null, 1)),
    chart: inline(JSON.stringify(chart)),
  };
  const page = readFileSync(join(src, 'page.html'), 'utf8').replace(/\{\{([\w.]+)\}\}/g, (_, key) => {
    if (key in slots) return slots[key];
    const v = key.split('.').reduce((o, k) => o?.[k], chart);
    if (typeof v !== 'string')
      throw new Error(`src/page.html: {{${key}}} has no value in people/${name}/chart.json`);
    return esc(v);
  });
  return page.replace(/^@@ (\S+)\n/gm, (_, path) => {
    const text = readFileSync(join(src, path), 'utf8');
    if (!text.endsWith('\n')) throw new Error(`src/${path} must end with a newline`);
    return text;
  });
}

// { 'index.html': text, 'charts/sam.html': text, ... } for every output
export function build() {
  const out = {};
  for (const [name, chart, content] of charts()) {
    const text = assemble(name, chart, content);
    for (const file of OUTPUTS[name] || [`charts/${name}.html`]) out[file] = text;
  }
  return out;
}

// Outputs whose file on disk differs from a fresh build
export function stale(built = build()) {
  return Object.keys(built).filter((file) => {
    const path = join(repo, file);
    return !existsSync(path) || readFileSync(path, 'utf8') !== built[file];
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  let built;
  try {
    built = build();
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
  if (args.includes('--check')) {
    const old = stale(built);
    if (old.length) {
      console.error(`Out of date: ${old.join(', ')}. Run: node scripts/build.mjs`);
      process.exit(1);
    }
    console.log('Built files are current.');
    process.exit(0);
  }
  const last = existsSync(record) ? JSON.parse(readFileSync(record, 'utf8')) : {};
  const edited = Object.keys(built).filter((file) => {
    const path = join(repo, file);
    if (!existsSync(path) || !last[file]) return false;
    const now = sha(readFileSync(path, 'utf8'));
    return now !== last[file] && now !== sha(built[file]);
  });
  if (edited.length && !args.includes('--force')) {
    console.error(
      `Edited by hand since the last build: ${edited.join(', ')}.\n` +
        'Move the change into src/ or people/ (ARCHITECTURE.md says which file owns what) and build again,\n' +
        'or run node scripts/build.mjs --force to throw the hand edit away.',
    );
    process.exit(1);
  }
  const next = { ...last };
  for (const [file, text] of Object.entries(built)) {
    writeFileSync(join(repo, file), text);
    next[file] = sha(text);
  }
  writeFileSync(record, JSON.stringify(next, null, 2) + '\n');
  console.log(`Built ${Object.keys(built).join(', ')}.`);
}
