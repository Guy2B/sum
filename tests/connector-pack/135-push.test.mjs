import test from 'node:test';import assert from 'node:assert/strict';
import {createPushIngress} from '../../modules/connector-pack/push-ingress.mjs';
test('Sprint 135 rejects duplicate push deliveries',()=>{const i=createPushIngress();assert.equal(i.ingest({id:'x'}).accepted,true);assert.equal(i.ingest({id:'x'}).duplicate,true);});
