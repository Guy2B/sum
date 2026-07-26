import test from 'node:test';import assert from 'node:assert/strict';
import { classifyExecutionOptions } from '../../modules/daily/delegation-engine.mjs';
test('Sprint 107 exposes do delegate batch ignore options',()=>{const [a]=classifyExecutionOptions([{title:'Confirmer le rendez-vous',priorityLevel:'high'}],{delegates:['famille']});assert.equal(a.executionOptions.doNow,true);assert.equal(a.executionOptions.delegate,true);});
