import test from 'node:test';import assert from 'node:assert/strict';
import { calculateCapacity } from '../../modules/daily/capacity-model.mjs';
test('Sprint 101 protects daily capacity',()=>{const c=calculateCapacity({availableMinutes:600,fixedMinutes:120,energy:.8});assert.ok(c.usableMinutes<480);assert.ok(c.usableMinutes>0);});
