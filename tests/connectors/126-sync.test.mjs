import test from 'node:test';import assert from 'node:assert/strict';
import { syncConnector } from '../../modules/connectors/sync-engine.mjs';
import { createCheckpointStore } from '../../modules/connectors/checkpoint-store.mjs';
test('Sprint 126 synchronizes incrementally',async()=>{const r=await syncConnector({connector:{id:'x',enabled:true},adapter:{async fetchSignals(){return{signals:[{id:1}],checkpoint:{cursor:1}}}},grant:{granted:['read-signals']},checkpointStore:createCheckpointStore()});assert.equal(r.status,'success');assert.equal(r.imported,1);});
