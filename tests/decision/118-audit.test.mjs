import test from 'node:test';import assert from 'node:assert/strict';
import { createDecisionAudit } from '../../modules/decision/audit-trail.mjs';
test('Sprint 118 records an auditable decision',()=>{const a=createDecisionAudit({context:{x:1},rankedOptions:[{option:{id:'a'},tradeoff:{score:90},safety:{safe:true,approvalRequired:false}}],recommendation:{option:{id:'a'}}});assert.ok(a.id);assert.equal(a.recommendation,'a');});
