'use strict';
const test=require('node:test');const assert=require('node:assert/strict');const {createEventBus}=require('../../modules/core/event-bus');
test('event bus publishes immutable events and keeps history',async()=>{const bus=createEventBus({maxHistory:2});let seen;bus.on('workspace.created',e=>{seen=e;});const event=await bus.emit('workspace.created',{id:'w1'},{actorId:'u1'});assert.equal(seen,event);assert.equal(event.actorId,'u1');assert.equal(bus.history().length,1);assert.throws(()=>{event.type='x';},TypeError);});
