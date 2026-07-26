import test from 'node:test';import assert from 'node:assert/strict';
import { createRateLimitGuard } from '../../modules/connectors/rate-limit-guard.mjs';
test('Sprint 124 protects connector quotas',()=>{const g=createRateLimitGuard({limit:1});assert.equal(g.consume('x').allowed,true);assert.equal(g.consume('x').allowed,false);});
