import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');

test('recovery module is additive and exposes diagnostics', () => {
  const source = fs.readFileSync(path.join(root, 'modules/social-connector-recovery-v749.js'), 'utf8');
  assert.match(source, /SigmaSocialConnectorRecoveryV749/);
  assert.match(source, /linkedin/);
  assert.match(source, /youtube/);
});

test('restoration payload includes all original provider adapters', () => {
  for (const name of ['linkedin', 'x', 'tiktok', 'youtube', 'meta']) {
    assert.equal(fs.existsSync(path.join(root, 'backend/social-connector/lib/providers', `${name}.js`)), true);
  }
});

test('payload does not contain destructive delete instructions', () => {
  const source = fs.readFileSync(path.join(root, 'tools/release-735-749-audit.mjs'), 'utf8');
  assert.doesNotMatch(source, /rmSync|unlinkSync|rmdirSync/);
});
