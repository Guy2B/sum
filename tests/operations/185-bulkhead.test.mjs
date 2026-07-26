import test from 'node:test';
import assert from 'node:assert/strict';
import { createBulkhead } from '../../modules/operations/bulkhead.mjs';

test('Sprint 185 bulkhead', async () => {
  const b=createBulkhead({concurrency:1});assert.equal(await b.execute(async()=>2),2);
});
