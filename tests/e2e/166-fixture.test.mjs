import test from 'node:test';import assert from 'node:assert/strict';import {createFixture} from '../../modules/e2e/fixture-factory.mjs';
test('Sprint 166 fixture',()=>{assert.equal(createFixture().profile.editions[0],'personal');});
