import test from 'node:test';import assert from 'node:assert/strict';
import {createRetentionPolicy,evaluateRetention} from '../../modules/trust/data-retention.mjs';
test('Sprint 141 identifies expired retained data',()=>{const p=createRetentionPolicy({defaultDays:30});const r=evaluateRetention([{createdAt:'2020-01-01'}],p,new Date('2026-01-01'));assert.equal(r.purge.length,1);});
