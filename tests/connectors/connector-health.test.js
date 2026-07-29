"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { HEALTH, calculateHealth, ConnectorHealthRegistry } = require("../../modules/connectors/connector-health.js");

test("marks recent success healthy", () => {
  assert.equal(calculateHealth({lastSuccessAt:900,staleAfterMs:200},1000), HEALTH.HEALTHY);
});

test("marks repeated failures unavailable", () => {
  assert.equal(calculateHealth({lastError:"x",consecutiveFailures:3},1000), HEALTH.UNAVAILABLE);
});

test("registry resets failures after success", () => {
  const registry = new ConnectorHealthRegistry({clock:()=>1000});
  registry.recordFailure("mail", new Error("down"));
  const result = registry.recordSuccess("mail");
  assert.equal(result.status, HEALTH.HEALTHY);
  assert.equal(result.record.consecutiveFailures, 0);
});
