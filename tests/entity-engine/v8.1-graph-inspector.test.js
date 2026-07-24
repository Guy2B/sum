'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const memory = require('../../modules/entity-engine/memory-v8.1');
const inspector = require('../../modules/entity-engine/inspector');

function storage() {
  const values = new Map();

  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
    removeItem(key) {
      values.delete(key);
    }
  };
}

function graph() {
  return {
    nodes: {
      p: {
        id: 'p',
        type: 'person',
        name: 'John Smith',
        aliases: ['john@acme.com']
      },
      c: {
        id: 'c',
        type: 'company',
        name: 'Acme'
      }
    },
    edges: [
      {
        from: 'p',
        to: 'c',
        type: 'works_for'
      }
    ],
    signalEntityMap: {
      s: ['p', 'c']
    }
  };
}

test('persists graph', () => {
  const localStorage = storage();

  memory.save(graph(), { storage: localStorage });

  assert.equal(
    memory.load({ storage: localStorage }).graph.edges.length,
    1
  );
});

test('merges without duplicate edge', () => {
  const localStorage = storage();

  memory.save(graph(), { storage: localStorage });
  memory.merge(graph(), { storage: localStorage });

  assert.equal(
    memory.load({ storage: localStorage }).graph.edges.length,
    1
  );
});

test('searches aliases', () => {
  const result = inspector.search(graph(), 'john@acme.com');

  assert.equal(result[0].id, 'p');
  assert.equal(result[0].degree, 1);
});

test('finds neighbors', () => {
  const result = inspector.neighbors(graph(), 'p');

  assert.equal(result[0].node.id, 'c');
  assert.equal(result[0].relation, 'works_for');
});

test('summarizes graph', () => {
  const result = inspector.summarize(graph());

  assert.equal(result.nodes, 2);
  assert.equal(result.edges, 1);
  assert.equal(result.signals, 1);
});
