import test from 'node:test';import assert from 'node:assert/strict';import {replayTrace} from '../../modules/e2e/replay-engine.mjs';
test('Sprint 171 replay',async ()=>{const r=await replayTrace([{type:'x',data:2}],{x:async x=>x*2});assert.equal(r[0],4);});
