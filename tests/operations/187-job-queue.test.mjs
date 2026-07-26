import test from 'node:test';
import assert from 'node:assert/strict';
import { createJobQueue } from '../../modules/operations/job-queue.mjs';

test('Sprint 187 job-queue', () => {
  const q=createJobQueue();const j=q.enqueue('x');q.complete(j.id,1);assert.equal(q.list()[0].status,'completed');
});
