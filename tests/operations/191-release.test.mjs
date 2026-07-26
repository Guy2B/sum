import test from 'node:test';
import assert from 'node:assert/strict';
import { createReleaseManifest } from '../../modules/operations/release-manifest.mjs';

test('Sprint 191 release', () => {
  assert.equal(createReleaseManifest({version:'1.0.0'}).format,'sigma-release-v1');
});
