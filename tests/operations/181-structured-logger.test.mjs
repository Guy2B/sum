import test from 'node:test';
import assert from 'node:assert/strict';
import { createStructuredLogger } from '../../modules/operations/structured-logger.mjs';

test('Sprint 181 structured-logger', () => {
  const lines=[];const l=createStructuredLogger({sink:{info:x=>lines.push(x)}});l.info('ok');assert.equal(lines.length,1);
});
