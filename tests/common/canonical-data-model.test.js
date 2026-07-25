'use strict';
const test=require('node:test'); const assert=require('node:assert/strict');
const {createCanonicalEntity,validateCanonicalEntity}=require('../../modules/common/canonical-data-model');
test('creates and validates canonical entities',()=>{const e=createCanonicalEntity({id:'t1',type:'Task',owner:'u1',workspaceId:'w1',source:'manual',confidence:.8,evidence:[{source:'user'}]});assert.equal(e.type,'Task');assert.equal(validateCanonicalEntity(e).valid,true);});
test('rejects unsupported entity type',()=>assert.throws(()=>createCanonicalEntity({id:'x',type:'Unknown',owner:'u',workspaceId:'w',source:'manual'})));
