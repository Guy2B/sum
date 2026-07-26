import test from 'node:test';import assert from 'node:assert/strict';
import { createConnectorDefinition } from '../../modules/connectors/connector-contract.mjs';
test('Sprint 120 defines a connector contract',()=>{const c=createConnectorDefinition({id:'demo-mail',name:'Mail',capabilities:['read-signals']});assert.equal(c.id,'demo-mail');assert.equal(c.pollIntervalMinutes,15);});
