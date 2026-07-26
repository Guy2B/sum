import test from 'node:test';import assert from 'node:assert/strict';
import { replanDay } from '../../modules/daily/replanning-engine.mjs';
test('Sprint 108 replans after completion',()=>{const p=replanDay({scheduled:[{id:'a'},{id:'b'}],deferred:[]},{type:'complete',actionId:'a'});assert.equal(p.scheduled.length,1);assert.equal(p.completed[0].id,'a');});
