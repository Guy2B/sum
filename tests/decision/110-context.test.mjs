import test from 'node:test';import assert from 'node:assert/strict';
import { buildDecisionContext } from '../../modules/decision/decision-context.mjs';
test('Sprint 110 builds a complete decision context',()=>{const c=buildDecisionContext({profile:{editions:['family']},constraints:{budget:200}});assert.equal(c.profile.editions[0],'family');assert.equal(c.constraints.budget,200);});
