import test from 'node:test';import assert from 'node:assert/strict';
import { createCheckpointStore } from '../../modules/connectors/checkpoint-store.mjs';
test('Sprint 123 persists incremental checkpoints',()=>{const s=createCheckpointStore();s.set('mail',{cursor:12});assert.equal(s.get('mail').cursor,12);});
