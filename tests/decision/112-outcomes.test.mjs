import test from 'node:test';import assert from 'node:assert/strict';
import { estimateOutcome } from '../../modules/decision/outcome-model.mjs';
test('Sprint 112 estimates benefit and risk',()=>{const o=estimateOutcome({id:'do-now',delayHours:0,effortMinutes:20},{action:{priorityLevel:'high'},constraints:{}});assert.ok(o.benefit>0);assert.ok(o.risk>=0);});
