import test from 'node:test';import assert from 'node:assert/strict';
import { estimateAction } from '../../modules/daily/action-estimator.mjs';
test('Sprint 102 estimates action effort',()=>{const a=estimateAction({title:'Préparer une candidature'});assert.ok(a.estimatedMinutes>=60);assert.equal(a.energy,'high');});
