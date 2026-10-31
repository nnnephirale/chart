// Builds the chart pages from src/. No dependencies: node scripts/build.mjs
//
// src/page.html is the page with one `@@ <path>` line wherever a source file goes; the build swaps each
// such line for that file (paths are relative to src/). The CSS files fill the <style>, in name order.
// The JS files are not modules: page.html opens one closure, `(() => { 'use strict';`, the files run
// inside it in name order and share its scope, and page.html closes it after the last one.
//
// Every output is one self-contained .html that opens with a double-click. Never edit an output by hand:
// the build records each output's sha256 in scripts/.built.json and refuses to overwrite a file that has
// changed since. Move the change into src/ (see ARCHITECTURE.md), or pass --force to discard it.
//
//   node scripts/build.mjs           write every output
//   node scripts/build.mjs --check   exit 1 if any output differs from a fresh build (writes nothing)
//   node scripts/build.mjs --force   overwrite outputs even if they were edited by hand
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = fileURLToPath(new URL('..', import.meta.url));
const src = join(repo, 'src');
const record = join(repo, 'scripts', '.built.json');

// Each page source and the files it is written to. index.html is the copy GitHub Pages serves.
export const PAGES = [{ page: 'page.html', out: ['lu-chart-desktop.html', 'index.html'] }];

const sha = (text) => createHash('sha256').update(text).digest('hex');

// Swap every `@@ path` line for that file's text; the file's own last newline ends the line.
export function assemble(page) {
  return readFileSync(join(src, page), 'utf8').replace(/^@@ (\S+)\n/gm, (_, path) => {
    const text = readFileSync(join(src, path), 'utf8');
    if (!text.endsWith('\n')) throw new Error(`src/${path} must end with a newline`);
    return text;
  });
}

// { 'index.html': text, ... } for every output
export function build() {
  const out = {};
  for (const { page, out: files } of PAGES) {
    const text = assemble(page);
    for (const file of files) out[file] = text;
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
  const built = build();
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
        'Move the change into src/ (ARCHITECTURE.md says which file owns what) and build again,\n' +
        'or run node scripts/build.mjs --force to throw the hand edit away.',
    );
    process.exit(1);
  }
  const next = {};
  for (const [file, text] of Object.entries(built)) {
    writeFileSync(join(repo, file), text);
    next[file] = sha(text);
  }
  writeFileSync(record, JSON.stringify(next, null, 2) + '\n');
  console.log(`Built ${Object.keys(built).join(', ')} from src/.`);
}
