'use strict';
const test=require('node:test');const assert=require('node:assert/strict');const {createGoal,score,plan}=require('../../modules/planning/goal-engine');
test('goal planning is deterministic and capacity bound',()=>{const now=Date.parse('2026-01-01T00:00:00Z');const a=createGoal({id:'a',workspaceId:'w',title:'Urgent',priority:80,targetAt:'2026-01-02T00:00:00Z'});const b=createGoal({id:'b',workspaceId:'w',title:'Later',priority:40,targetAt:'2026-03-01T00:00:00Z'});assert.ok(score(a,now)>score(b,now));assert.deepEqual(plan([b,a],{capacity:1,now}).map(x=>x.goal.id),['a']);});
