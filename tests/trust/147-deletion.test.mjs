import test from 'node:test';import assert from 'node:assert/strict';
import {buildDeletionPlan} from '../../modules/trust/deletion-plan.mjs';
test('Sprint 147 prepares confirmed deletion',()=>{const p=buildDeletionPlan({userId:'u',retainedItems:[{type:'signal'}]});assert.equal(p.requiresConfirmation,true);assert.ok(p.steps.length>=4);});
