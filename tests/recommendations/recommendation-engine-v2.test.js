'use strict';
const test=require('node:test'); const assert=require('node:assert/strict'); const {RecommendationEngineV2}=require('../../modules/recommendations/recommendation-engine-v2');
test('ranks explainable recommendations',()=>{const r=new RecommendationEngineV2().generate({candidates:[{id:'a',action:'A',impact:1,urgency:1,confidence:1},{id:'b',action:'B',impact:.2,urgency:.2,confidence:.2}]});assert.equal(r[0].id,'a');assert.match(r[0].explanation,/composite score/);});
