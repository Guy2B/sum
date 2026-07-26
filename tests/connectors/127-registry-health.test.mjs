import test from 'node:test';import assert from 'node:assert/strict';
import { createAdapterRegistry } from '../../modules/connectors/adapter-registry.mjs';
import { evaluateConnectorHealth } from '../../modules/connectors/health-monitor.mjs';
test('Sprint 127 registers adapters and reports health',()=>{const r=createAdapterRegistry();r.register('x',{fetchSignals(){}});assert.equal(r.list()[0],'x');assert.equal(evaluateConnectorHealth({lastSuccessAt:new Date().toISOString()}).status,'healthy');});
