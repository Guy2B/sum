'use strict';
const test=require('node:test'); const assert=require('node:assert/strict'); const {WorkspaceHouseholdEngine}=require('../../modules/workspace/workspace-household-engine');
test('supports household roles and inheritance',()=>{const e=new WorkspaceHouseholdEngine();e.create({id:'family',type:'household',ownerId:'parent'});e.addMember('family','kid','child');e.create({id:'child-space',type:'personal',ownerId:'kid',parentId:'family'});assert.equal(e.effectiveRole('child-space','parent'),'owner');assert.equal(e.can('family','kid','admin'),false);});
