import test from 'node:test';import assert from 'node:assert/strict';
import {createCalendarAdapter} from '../../modules/connector-pack/calendar-adapter.mjs';
test('Sprint 132 maps calendar events to deadlines',async()=>{const a=createCalendarAdapter({async listEvents(){return{events:[{id:'1',title:'RDV',start:'2026-08-01T10:00:00Z'}]}}});const r=await a.fetchSignals({});assert.equal(r.signals[0].deadline,'2026-08-01T10:00:00Z');});
