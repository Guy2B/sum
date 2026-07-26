import test from 'node:test';import assert from 'node:assert/strict';
import { assessMentalLoad } from '../../modules/daily/mental-load-engine.mjs';
test('Sprint 106 detects excessive mental load',()=>{const m=assessMentalLoad({actions:Array.from({length:10},(_,i)=>({priorityLevel:i<5?'critical':'high'})),unresolvedSignals:20,contextSwitches:8});assert.ok(['high','very-high'].includes(m.level));});
