import test from 'node:test';
import assert from 'node:assert/strict';
import { FeatureFlagEngine } from '../../modules/features/feature-flag-engine.js';

test('Sprint 23 evaluates edition rules and workspace overrides', () => {
  const flags = new FeatureFlagEngine();
  flags.define({ key: 'advanced-planning', rules: [{ when: { edition: 'business' }, value: true }] });
  assert.equal(flags.evaluate('advanced-planning', { edition: 'business' }).enabled, true);
  flags.setOverride('workspace-1', 'advanced-planning', false);
  assert.equal(flags.evaluate('advanced-planning', { workspaceId: 'workspace-1', edition: 'business' }).enabled, false);
});
