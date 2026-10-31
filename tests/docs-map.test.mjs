import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// ARCHITECTURE.md is the one map of the code: every source file is in it, and everything it names exists.
const repo = fileURLToPath(new URL('..', import.meta.url));
const dirs = ['src', 'src/css', 'src/js', 'scripts', 'tests', 'people/lu'];
const code = /\.(m?js|css|html|json)$/;

test('ARCHITECTURE.md lists every source file and only files that exist', () => {
  const map = readFileSync(join(repo, 'ARCHITECTURE.md'), 'utf8');
  const files = dirs.flatMap((d) =>
    readdirSync(join(repo, d))
      .filter((n) => code.test(n) && !n.startsWith('.'))
      .map((n) => `${d}/${n}`),
  );
  const missing = files.filter((f) => !map.includes('`' + f + '`'));
  assert.deepEqual(missing, [], 'Add these to ARCHITECTURE.md');
  const named = [...map.matchAll(/`((?:src|scripts|tests|people|charts)\/[^`\s*<]+\.[a-z]+)`/g)].map(
    (m) => m[1],
  );
  const gone = named.filter((p) => !existsSync(join(repo, p)));
  assert.deepEqual(gone, [], 'ARCHITECTURE.md names files that no longer exist');
});
