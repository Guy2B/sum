import test from 'node:test';import assert from 'node:assert/strict';import {createTraceRecorder} from '../../modules/e2e/trace-recorder.mjs';
test('Sprint 169 trace',()=>{const r=createTraceRecorder();r.record('x');assert.equal(r.list().length,1);});
