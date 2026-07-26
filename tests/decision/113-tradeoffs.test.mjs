import test from 'node:test';import assert from 'node:assert/strict';
import { scoreTradeoff } from '../../modules/decision/tradeoff-engine.mjs';
test('Sprint 113 produces a bounded tradeoff score',()=>{const s=scoreTradeoff({id:'do-now'},{benefit:.8,risk:.2,effortMinutes:30,cost:0},{profile:{riskTolerance:'balanced'},constraints:{}});assert.ok(s.score>=0&&s.score<=100);});
