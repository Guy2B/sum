'use strict';
const test=require('node:test'); const assert=require('node:assert/strict'); const {TemporalEngineV2}=require('../../modules/temporal/temporal-engine-v2');
test('handles overlap recurrence and progress',()=>{const e=new TemporalEngineV2();const a=e.createInterval({id:'a',start:'2026-01-01T09:00:00Z',end:'2026-01-01T10:00:00Z'});const b=e.createInterval({id:'b',start:'2026-01-01T09:30:00Z',end:'2026-01-01T11:00:00Z'});assert.equal(e.overlaps(a,b),true);assert.equal(e.expandDaily(a,3).length,3);assert.equal(e.progress(a,'2026-01-01T09:30:00Z'),.5);});
