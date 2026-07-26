import test from 'node:test';import assert from 'node:assert/strict';
import { createConnectorRuntime } from '../../modules/connectors/connector-runtime.mjs';
import { validateConnectorRuntime } from '../../modules/connectors/product-acceptance.mjs';
test('Sprint 129 validates the connected signal flow',async()=>{const runtime=createConnectorRuntime();const installation=runtime.install({id:'demo',name:'Demo',capabilities:['read-signals']},{async fetchSignals(){return{signals:[{source:'email',subject:'Facture demain'}],checkpoint:{cursor:1}}}});const syncResult=await runtime.sync('demo');assert.equal(validateConnectorRuntime({installation,syncResult}).ok,true);});
