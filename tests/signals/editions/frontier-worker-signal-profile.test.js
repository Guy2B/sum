import test from 'node:test'; import assert from 'node:assert/strict'; import { frontierWorkerSignalProfile as p } from '../../../modules/signals/editions/frontier-worker-signal-profile.js';
test('Sprint 72 frontier profile covers cross-border risks',()=>{assert.ok(p.domains.includes('cross-border-tax'));assert.equal(p.priorityBoosts.permit,25);});
