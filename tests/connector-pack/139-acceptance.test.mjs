import test from 'node:test';import assert from 'node:assert/strict';
import {createConnectorRuntime} from '../../modules/connectors/connector-runtime.mjs';
import {installStandardConnectorPack} from '../../modules/connector-pack/connector-pack.mjs';
import {syncAllConnectors} from '../../modules/connector-pack/sync-orchestrator.mjs';
import {validateStandardConnectorPack} from '../../modules/connector-pack/product-acceptance.mjs';
test('Sprint 139 validates the standard connector pack',async()=>{const runtime=createConnectorRuntime();const clients={email:{async listMessages(){return{messages:[{id:'1',subject:'Urgent'}]}}},calendar:{async listEvents(){return{events:[{id:'2',title:'RDV'}]}}},documents:{async listDocuments(){return{documents:[{id:'3',name:'Doc'}]}}}};const installations=installStandardConnectorPack(runtime,clients);const orchestration=await syncAllConnectors({runtime,connectorIds:runtime.list().map(x=>x.id)});assert.equal(validateStandardConnectorPack({installations,orchestration}).ok,true);});
