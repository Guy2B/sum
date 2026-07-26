import test from 'node:test';import assert from 'node:assert/strict';import {buildEditionScenarios} from '../../modules/e2e/edition-scenarios.mjs';
test('Sprint 174 editions',()=>{assert.equal(buildEditionScenarios().length,9);});
