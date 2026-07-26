import test from 'node:test';import assert from 'node:assert/strict';import {assertScenario} from '../../modules/e2e/assertion-engine.mjs';
test('Sprint 168 assertions',()=>{assert.equal(assertScenario({a:{b:1}},[{path:'a.b',equals:1}]).ok,true);});
