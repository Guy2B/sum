"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const {
  CONNECTOR_STATES,
  STANDARD_CAPABILITIES,
  ConnectorContractError,
  ConnectorOperationError,
  ConnectorRegistry,
  ConnectorManager,
  normalizeConnectorError,
} = require("../../modules/connectors/universal-connector-core.js");

function createConnector(overrides = {}) {
  return {
    id: "outlook",
    capabilities: [
      STANDARD_CAPABILITIES.MAIL_READ,
      STANDARD_CAPABILITIES.CALENDAR_READ,
    ],
    async connect() {
      return { connected: true };
    },
    async sync() {
      return { cursor: "cursor-1", items: 3 };
    },
    async disconnect() {
      return { disconnected: true };
    },
    ...overrides,
  };
}

test("Sprint 76 registry validates and stores connector contracts", () => {
  const registry = new ConnectorRegistry();
  const connector = registry.register(createConnector());

  assert.equal(registry.get("outlook"), connector);
  assert.equal(registry.has("outlook"), true);
  assert.deepEqual(
    registry.list({ capability: STANDARD_CAPABILITIES.MAIL_READ }),
    [connector],
  );
});

test("Sprint 76 registry rejects duplicates and incomplete connectors", () => {
  const registry = new ConnectorRegistry();
  registry.register(createConnector());

  assert.throws(
    () => registry.register(createConnector()),
    ConnectorContractError,
  );

  assert.throws(
    () => registry.register({ id: "broken", capabilities: [] }),
    /must implement connect/,
  );
});

test("Sprint 76 manager connects and records health", async () => {
  const registry = new ConnectorRegistry();
  registry.register(createConnector());

  let tick = 0;
  const manager = new ConnectorManager({
    registry,
    clock: () => new Date(`2026-07-29T08:00:0${tick++}.000Z`),
  });

  const result = await manager.connect("outlook");
  const health = manager.getHealth("outlook");

  assert.deepEqual(result, { connected: true });
  assert.equal(health.state, CONNECTOR_STATES.CONNECTED);
  assert.equal(health.lastAttemptAt, "2026-07-29T08:00:00.000Z");
  assert.equal(health.lastSuccessAt, "2026-07-29T08:00:01.000Z");
  assert.equal(health.lastError, null);
});

test("Sprint 76 manager delegates synchronization without altering payloads", async () => {
  const registry = new ConnectorRegistry();
  const expected = { cursor: "next-page", signals: [{ type: "mail" }] };
  registry.register(
    createConnector({
      async sync(context) {
        assert.deepEqual(context, { cursor: "previous-page" });
        return expected;
      },
    }),
  );

  const manager = new ConnectorManager({ registry });
  const result = await manager.sync("outlook", { cursor: "previous-page" });

  assert.equal(result, expected);
  assert.equal(manager.getHealth("outlook").state, CONNECTOR_STATES.CONNECTED);
});

test("Sprint 76 errors are normalized and retryable failures degrade health", async () => {
  const registry = new ConnectorRegistry();
  registry.register(
    createConnector({
      async sync() {
        const error = new Error("Microsoft throttled the request.");
        error.status = 429;
        error.code = "THROTTLED";
        throw error;
      },
    }),
  );

  const manager = new ConnectorManager({ registry });

  await assert.rejects(
    () => manager.sync("outlook"),
    (error) => {
      assert.equal(error instanceof ConnectorOperationError, true);
      assert.equal(error.connectorId, "outlook");
      assert.equal(error.operation, "sync");
      assert.equal(error.retryable, true);
      return true;
    },
  );

  const health = manager.getHealth("outlook");
  assert.equal(health.state, CONNECTOR_STATES.DEGRADED);
  assert.equal(health.lastError.code, "THROTTLED");
});

test("Sprint 76 normalization preserves existing connector operation errors", () => {
  const original = new ConnectorOperationError("Known failure.", {
    code: "KNOWN",
    connectorId: "outlook",
    operation: "connect",
  });

  assert.equal(normalizeConnectorError(original), original);
});
