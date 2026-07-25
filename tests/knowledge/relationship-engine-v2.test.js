'use strict';
const test=require('node:test'); const assert=require('node:assert/strict'); const {RelationshipEngineV2}=require('../../modules/knowledge/relationship-engine-v2');
test('stores weighted typed relationships and history',()=>{const e=new RelationshipEngineV2();e.upsert({from:'p1',to:'pr1',type:'works_on',weight:.7});assert.equal(e.find({from:'p1'})[0].weight,.7);e.mergeEntity('p1','p2');assert.equal(e.find({from:'p2'}).length,1);assert.ok(e.getHistory().length>=3);});
