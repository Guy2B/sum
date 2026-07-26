import test from 'node:test';import assert from 'node:assert/strict';
import { importConnectorSignals } from '../../modules/connectors/signal-import-pipeline.mjs';
test('Sprint 128 feeds connectors into attention intelligence',()=>{const r=importConnectorSignals([{source:'email',subject:'Urgent action requise aujourd’hui'}]);assert.equal(r.imported,1);assert.ok(r.queue.counts.critical+r.queue.counts.high>=1);});
