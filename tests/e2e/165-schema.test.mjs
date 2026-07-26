import test from 'node:test';import assert from 'node:assert/strict';import {createScenario} from '../../modules/e2e/scenario-schema.mjs';
test('Sprint 165 schema',()=>{const s=createScenario({id:'x',title:'X'});assert.equal(s.status,'draft');});
