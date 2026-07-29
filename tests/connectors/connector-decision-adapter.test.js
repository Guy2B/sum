"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { toDecisionSignal, createDecisionInput } = require("../../modules/connectors/connector-decision-adapter.js");

test("adapts mail without applying business ranking", () => {
  const signal = toDecisionSignal({id:"m1",source:"outlook-mail",subject:"Hello",receivedAt:"2026-07-29T10:00:00Z",isRead:false});
  assert.equal(signal.category,"communication");
  assert.equal(signal.title,"Hello");
  assert.equal(signal.facts.isRead,false);
  assert.equal("score" in signal,false);
});

test("creates versioned decision input", () => {
  const input = createDecisionInput({signals:[{id:"1"}],health:[],syncedAt:"now"});
  assert.equal(input.version,1);
  assert.equal(input.generatedAt,"now");
});
