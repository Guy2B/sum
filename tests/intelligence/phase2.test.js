'use strict';
const test=require('node:test');const assert=require('node:assert/strict');
const Engine=require('../../modules/intelligence/services/engine.js');
const Relationship=require('../../modules/intelligence/services/relationship-service.js');
const Explanation=require('../../modules/intelligence/services/explanation-service.js');
test('relationship engine links a signal to a project and objective',()=>{const signal={content:{title:'Finaliser projet Alpha',summary:'Objectif lancement rentable',body:'',sender:''}};const result=Relationship.resolve(signal,{projects:[{id:'p1',title:'Projet Alpha'}],goals:[{id:'g1',title:'Lancement rentable'}]});assert.equal(result.projects[0].id,'p1');assert.equal(result.objectives[0].id,'g1');});
test('engine adds explainable recommendation and relationships',()=>{const state={mailMessages:[{id:'m1',provider:'gmail',subject:'Devis projet Alpha à confirmer',snippet:'Merci de répondre aujourd’hui',sender:'Client',receivedAt:new Date().toISOString(),needsReply:true,importance:'high'}],projects:[{id:'p1',title:'Projet Alpha'}]};const [signal]=Engine.analyzeWorkspace(state);assert.ok(signal.explanation.summary);assert.equal(signal.recommendation.action,'reply');assert.equal(signal.recommendation.requiresApproval,true);assert.equal(signal.entities.projects[0].id,'p1');});
test('low confidence explanations expose uncertainty',()=>{const explanation=Explanation.explain({content:{},intelligence:{priorityScore:20,confidence:{score:40}},recommendation:{label:'Lire',rationaleCodes:[]}});assert.ok(explanation.uncertainty.length>=1);});
