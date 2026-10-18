import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const htmlFiles = fs.readdirSync(root).filter(name => name.endsWith('.html'));
const localRefs = [];
for (const file of htmlFiles) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  for (const match of source.matchAll(/(?:href|src)="([^"]+)"/gi)) {
    const ref = match[1];
    if (!ref || ref.startsWith('#') || /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(ref)) continue;
    const target = decodeURIComponent(ref.split(/[?#]/, 1)[0]);
    if (!target) continue;
    const resolved = path.resolve(path.dirname(path.join(root, file)), target);
    localRefs.push({ file, ref, resolved });
  }
}

test('all local HTML href and src references resolve inside the published site', () => {
  const outside = localRefs.filter(item => !item.resolved.startsWith(root + path.sep));
  assert.deepEqual(outside, [], `local references escape the site root: ${JSON.stringify(outside)}`);
  const missing = localRefs.filter(item => !fs.existsSync(item.resolved));
  assert.deepEqual(missing, [], `missing local references: ${JSON.stringify(missing)}`);
});
