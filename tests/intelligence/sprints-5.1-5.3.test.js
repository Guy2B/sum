'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const Store=require('../../functions/src/intelligence/signal-store.js');
const Relationships=require('../../modules/intelligence/services/relationship-service.js');
const Priority=require('../../modules/intelligence/services/priority-service.js');
const Engine=require('../../modules/intelligence/services/engine.js');

test('Sprint 5.1 sanitizes and keys signals idempotently',()=>{
 const raw={id:'mail:gmail:a/b',source:{domain:'mail',provider:'gmail',sourceType:'message',sourceId:'a/b'},content:{title:'Hello',receivedAt:'2026-07-23T08:00:00Z'},entities:{contacts:[]},intelligence:{category:'communication',importance:{score:999},urgency:{score:-5},impact:{score:50},confidence:{score:80},priorityScore:71},recommendation:{action:'reply',requiresApproval:true}};
 const clean=Store.cleanSignal(raw,'user-1');
 assert.equal(clean.userId,'user-1');assert.equal(clean.intelligence.importance.score,100);assert.equal(clean.intelligence.urgency.score,0);assert.equal(Store.docId(raw.id),Store.docId(raw.id));assert.equal(Store.docId(raw.id).length,64);
});

test('Sprint 5.2 resolves exact entities and builds an explainable graph',()=>{
 const signal={id:'m1',content:{title:'Projet Sigma avec Acme',body:'',summary:'',sender:'Jean <jean@acme.com>'},facts:{projectId:'p1'},entities:{contacts:[],companies:[],projects:[],objectives:[]}};
 const state={contacts:[{id:'c1',name:'Jean',email:'jean@acme.com'}],companies:[{id:'co1',name:'Acme',domain:'acme.com'}],projects:[{id:'p1',title:'Sigma'}],goals:[{id:'g1',title:'Développer Sigma'}]};
 const entities=Relationships.resolve(signal,state);
 assert.equal(entities.contacts[0].confidence,1);assert.equal(entities.companies[0].matchType,'exact');assert.equal(entities.projects[0].confidence,1);
 const graph=Relationships.buildGraph([{...signal,entities}]);assert.ok(graph.nodes.length>=4);assert.ok(graph.edges.every(edge=>Array.isArray(edge.evidence)));
});

test('Sprint 5.3 priority is deterministic and exposes formula and band',()=>{
 const signal={entities:{dates:[{role:'due',value:'2026-07-23T18:00:00Z'}],contacts:[{id:'c1'}],companies:[],projects:[],objectives:[]},_sourceRaw:{important:true,needsReply:true,estimate:15}};
 const classification={category:'communication',subcategory:'reply',confidence:{score:80,reasons:[]}};
 const a=Priority.score(signal,classification,{now:'2026-07-23T09:00:00Z'}),b=Priority.score(signal,classification,{now:'2026-07-23T09:00:00Z'});
 assert.deepEqual(a,b);assert.equal(a.engineVersion,'2.0.0');assert.ok(['low','medium','high','critical'].includes(a.priorityBand));assert.equal(a.formula.result,a.priorityScore);assert.ok(a.urgency.factors.some(x=>x.code==='deadline.today'));
});

test('Engine links relationships before calculating priority',()=>{
 const state={contacts:[{id:'c1',name:'Jean',email:'jean@acme.com'}],mailMessages:[{id:'m1',provider:'gmail',subject:'Réponse attendue',snippet:'Merci de répondre',sender:'Jean <jean@acme.com>',receivedAt:'2026-07-23T08:00:00Z',needsReply:true}]};
 const row=Engine.analyzeWorkspace(state,{now:'2026-07-23T09:00:00Z'})[0];
 assert.equal(row.entities.contacts[0].id,'c1');assert.ok(row.intelligence.importance.reasons.includes('relationships.linked'));
});
