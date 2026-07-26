import test from 'node:test';import assert from 'node:assert/strict';
import { calculateRetry,isRetryableError } from '../../modules/connectors/retry-policy.mjs';
test('Sprint 125 applies exponential retry',()=>{assert.equal(calculateRetry({attempt:3,baseDelayMs:100}).delayMs,400);assert.equal(isRetryableError({status:503}),true);});
