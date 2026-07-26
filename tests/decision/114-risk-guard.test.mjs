import test from 'node:test';import assert from 'node:assert/strict';
import { assessDecisionSafety } from '../../modules/decision/risk-guard.mjs';
test('Sprint 114 blocks sensitive automatic execution',()=>{const s=assessDecisionSafety({id:'do-now',reversible:false},{action:{kind:'pay'},constraints:{budget:500},signal:{priority:{confidence:.9}}});assert.equal(s.safe,false);assert.equal(s.approvalRequired,true);});
