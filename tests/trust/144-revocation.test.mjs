import test from 'node:test';import assert from 'node:assert/strict';
import {revokeSubjectAccess} from '../../modules/trust/revocation-engine.mjs';
test('Sprint 144 disables all access for one subject',()=>{const r=revokeSubjectAccess({subject:'mail',connectorDefinitions:[{id:'mail',enabled:true}]});assert.equal(r.connectorDefinitions[0].enabled,false);});
