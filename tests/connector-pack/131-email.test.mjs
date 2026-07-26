import test from 'node:test';import assert from 'node:assert/strict';
import {createEmailAdapter} from '../../modules/connector-pack/email-adapter.mjs';
test('Sprint 131 maps email messages to signals',async()=>{const a=createEmailAdapter({async listMessages(){return{messages:[{id:'1',subject:'Test'}]}}});const r=await a.fetchSignals({});assert.equal(r.signals[0].source,'email');});
