"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { fuseSignals, groupSignalsByEntity } = require("../../modules/connectors/connector-signal-fusion.js");

test("fuses, deduplicates and sorts signals", () => {
  const result = fuseSignals([
    {source:"mail",items:[{id:"1",type:"message",timestamp:"2026-07-29T10:00:00Z"}]},
    {source:"mail",items:[{id:"1",type:"message",timestamp:"2026-07-29T10:00:00Z"},{id:"2",type:"message",timestamp:"2026-07-29T11:00:00Z"}]}
  ]);
  assert.equal(result.length, 2);
  assert.equal(result[0].id, "2");
});

test("groups signals by entity", () => {
  const groups = groupSignalsByEntity([{entityId:"x"},{entityId:"x"},{entityId:null}]);
  assert.equal(groups.x.length, 2);
  assert.equal(groups.unassigned.length, 1);
});
