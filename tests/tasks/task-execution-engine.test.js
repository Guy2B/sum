'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { TaskExecutionEngine } = require('../../modules/tasks/task-execution-engine');
test('Sprint 34 enforces dependencies and capacity', () => {
  const engine = new TaskExecutionEngine();
  const a = engine.createTask({ id: 'a', title: 'A', workspaceId: 'w', priority: 1, estimateMinutes: 60 });
  const b = engine.createTask({ id: 'b', title: 'B', workspaceId: 'w', dependencies: ['a'], estimateMinutes: 60 });
  assert.deepEqual(engine.selectNext([a, b], { capacityMinutes: 60 }).map(item => item.id), ['a']);
  const ready = engine.transition(b, 'ready');
  assert.throws(() => engine.transition(ready, 'in-progress'), /dependencies unresolved/);
});
