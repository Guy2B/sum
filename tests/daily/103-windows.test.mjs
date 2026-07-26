import test from 'node:test';import assert from 'node:assert/strict';
import { buildTimeWindows } from '../../modules/daily/time-window-engine.mjs';
test('Sprint 103 creates free time windows',()=>{const w=buildTimeWindows({dayStart:'08:00',dayEnd:'12:00',fixedEvents:[{start:'09:00',end:'10:00'}]});assert.equal(w.length,2);assert.equal(w[0].minutes,60);});
