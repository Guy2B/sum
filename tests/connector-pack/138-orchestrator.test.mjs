import test from 'node:test';import assert from 'node:assert/strict';
import {syncAllConnectors} from '../../modules/connector-pack/sync-orchestrator.mjs';
test('Sprint 138 orchestrates several sources',async()=>{const runtime={async sync(id){return{status:'success',imported:{imported:1}}}};const r=await syncAllConnectors({runtime,connectorIds:['a','b']});assert.equal(r.successful,2);assert.equal(r.imported,2);});
