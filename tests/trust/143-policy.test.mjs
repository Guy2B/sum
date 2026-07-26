import test from 'node:test';import assert from 'node:assert/strict';
import {evaluateActionPolicy} from '../../modules/trust/action-policy.mjs';
test('Sprint 143 requires approval for sensitive actions',()=>{const r=evaluateActionPolicy({id:'x',kind:'transfer',subject:'bank'},{trustedSubjects:['bank']});assert.equal(r.allowed,false);assert.equal(r.approvalRequired,true);});
