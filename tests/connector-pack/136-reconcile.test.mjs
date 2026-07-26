import test from 'node:test';import assert from 'node:assert/strict';
import {reconcileChanges} from '../../modules/connector-pack/change-reconciler.mjs';
test('Sprint 136 reconciles connector updates',()=>{const r=reconcileChanges([{externalId:'x',title:'A'}],[{externalId:'x',title:'B'}]);assert.equal(r.updated.length,1);assert.equal(r.items[0].title,'B');});
