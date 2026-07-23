'use strict';
const test=require('node:test');const assert=require('node:assert/strict');
const {cleanSignal,ALLOWED_ACTIONS}=require('../../functions/src/intelligence/action-engine.js');
const schema=require('../../modules/intelligence/core/signal-schema.js');
const engine=require('../../modules/intelligence/services/engine.js');
test('server sanitizer binds signal to authenticated user',()=>{const signal=schema.create({id:'mail:gmail:1',userId:'spoof',source:{domain:'mail',provider:'gmail',sourceId:'1'},content:{title:'Réponse requise'}});const clean=cleanSignal(signal,'real-user');assert.equal(clean.userId,'real-user');assert.equal(clean.id,'mail:gmail:1');assert.equal(clean.schemaVersion,1);});
test('action allow-list contains only supported V1 actions',()=>{for(const action of schema.ACTIONS)assert.equal(ALLOWED_ACTIONS.has(action),true);assert.equal(ALLOWED_ACTIONS.has('delete_external_content'),false);});
test('engine remains deterministic for equal input',()=>{const state={tasks:[{id:'t1',title:'Envoyer le dossier',dueDate:'2026-07-24',priority:'high'}]};const a=engine.analyzeWorkspace(state,{now:'2026-07-23T10:00:00Z'}),b=engine.analyzeWorkspace(state,{now:'2026-07-23T10:00:00Z'});assert.equal(a[0].id,b[0].id);assert.equal(a[0].intelligence.priorityScore,b[0].intelligence.priorityScore);assert.equal(a[0].recommendation.action,b[0].recommendation.action);});
