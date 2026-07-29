"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { MemoryCursorStore, IncrementalSyncRunner } = require("../../modules/connectors/incremental-sync.js");

test("walks pages and persists delta cursor", async () => {
  const store = new MemoryCursorStore();
  const runner = new IncrementalSyncRunner({cursorStore:store});
  const seen = [];
  const result = await runner.run({
    connectorId:"mail",
    fetchPage: async ({cursor}) => cursor ? {items:[2],deltaCursor:"delta"} : {items:[1],nextCursor:"page2"},
    onItems: async (items) => seen.push(...items)
  });
  assert.deepEqual(seen,[1,2]);
  assert.equal(result.cursor,"delta");
  assert.equal(await store.get("mail:default"),"delta");
});

test("protects against endless pagination", async () => {
  const runner = new IncrementalSyncRunner({maxPages:2});
  await assert.rejects(() => runner.run({
    connectorId:"mail",
    fetchPage: async () => ({items:[],nextCursor:"again"})
  }), /maxPages/);
});
