/**
 * Sigma W7.1 Sprint 76 - Universal Connector Core
 *
 * Additive infrastructure only. This module does not alter the decision engine,
 * signal rules, UI rendering, or existing connector implementations.
 */

"use strict";

const CONNECTOR_STATES = Object.freeze({
  DISCONNECTED: "disconnected",
  CONNECTING: "connecting",
  CONNECTED: "connected",
  SYNCING: "syncing",
  DEGRADED: "degraded",
  ERROR: "error",
});

const STANDARD_CAPABILITIES = Object.freeze({
  MAIL_READ: "mail.read",
  MAIL_SEND: "mail.send",
  CALENDAR_READ: "calendar.read",
  CALENDAR_WRITE: "calendar.write",
  CONTACTS_READ: "contacts.read",
  FILES_READ: "files.read",
  HEALTH: "health",
  INCREMENTAL_SYNC: "incremental-sync",
});

class ConnectorContractError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "ConnectorContractError";
    this.code = "CONNECTOR_CONTRACT_ERROR";
    this.details = details;
  }
}

class ConnectorOperationError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = "ConnectorOperationError";
    this.code = options.code || "CONNECTOR_OPERATION_ERROR";
    this.connectorId = options.connectorId || null;
    this.operation = options.operation || null;
    this.retryable = Boolean(options.retryable);
    this.cause = options.cause;
  }
}

function normalizeConnectorError(error, context = {}) {
  if (error instanceof ConnectorOperationError) {
    return error;
  }

  const status = Number(error?.status || error?.statusCode || 0);
  const code = String(error?.code || "CONNECTOR_OPERATION_ERROR");
  const retryable =
    status === 408 ||
    status === 429 ||
    status >= 500 ||
    ["ETIMEDOUT", "ECONNRESET", "EAI_AGAIN"].includes(code);

  return new ConnectorOperationError(
    error?.message || "Connector operation failed.",
    {
      code,
      connectorId: context.connectorId,
      operation: context.operation,
      retryable,
      cause: error,
    },
  );
}

function validateConnectorDefinition(definition) {
  if (!definition || typeof definition !== "object") {
    throw new ConnectorContractError("Connector definition must be an object.");
  }

  if (!definition.id || typeof definition.id !== "string") {
    throw new ConnectorContractError("Connector id must be a non-empty string.");
  }

  if (!Array.isArray(definition.capabilities)) {
    throw new ConnectorContractError(
      `Connector "${definition.id}" must declare a capabilities array.`,
    );
  }

  for (const method of ["connect", "sync", "disconnect"]) {
    if (typeof definition[method] !== "function") {
      throw new ConnectorContractError(
        `Connector "${definition.id}" must implement ${method}().`,
        { connectorId: definition.id, missingMethod: method },
      );
    }
  }

  return definition;
}

class ConnectorRegistry {
  #connectors = new Map();

  register(definition) {
    const connector = validateConnectorDefinition(definition);

    if (this.#connectors.has(connector.id)) {
      throw new ConnectorContractError(
        `Connector "${connector.id}" is already registered.`,
        { connectorId: connector.id },
      );
    }

    this.#connectors.set(connector.id, connector);
    return connector;
  }

  unregister(connectorId) {
    return this.#connectors.delete(connectorId);
  }

  get(connectorId) {
    return this.#connectors.get(connectorId) || null;
  }

  require(connectorId) {
    const connector = this.get(connectorId);
    if (!connector) {
      throw new ConnectorContractError(
        `Connector "${connectorId}" is not registered.`,
        { connectorId },
      );
    }
    return connector;
  }

  list({ capability } = {}) {
    const connectors = [...this.#connectors.values()];
    if (!capability) return connectors;
    return connectors.filter((item) => item.capabilities.includes(capability));
  }

  has(connectorId) {
    return this.#connectors.has(connectorId);
  }
}

class ConnectorManager {
  #registry;
  #clock;
  #health = new Map();

  constructor({ registry = new ConnectorRegistry(), clock = () => new Date() } = {}) {
    this.#registry = registry;
    this.#clock = clock;
  }

  get registry() {
    return this.#registry;
  }

  async connect(connectorId, context = {}) {
    return this.#run(connectorId, "connect", CONNECTOR_STATES.CONNECTING, context);
  }

  async sync(connectorId, context = {}) {
    return this.#run(connectorId, "sync", CONNECTOR_STATES.SYNCING, context);
  }

  async disconnect(connectorId, context = {}) {
    const result = await this.#run(
      connectorId,
      "disconnect",
      CONNECTOR_STATES.DISCONNECTED,
      context,
    );
    this.#setHealth(connectorId, {
      state: CONNECTOR_STATES.DISCONNECTED,
      lastError: null,
    });
    return result;
  }

  getHealth(connectorId) {
    return {
      connectorId,
      state: CONNECTOR_STATES.DISCONNECTED,
      lastAttemptAt: null,
      lastSuccessAt: null,
      lastError: null,
      ...(this.#health.get(connectorId) || {}),
    };
  }

  listHealth() {
    return this.#registry.list().map((item) => this.getHealth(item.id));
  }

  async #run(connectorId, operation, transientState, context) {
    const connector = this.#registry.require(connectorId);
    const attemptedAt = this.#clock().toISOString();

    this.#setHealth(connectorId, {
      state: transientState,
      lastAttemptAt: attemptedAt,
      lastError: null,
    });

    try {
      const result = await connector[operation](context);
      const successAt = this.#clock().toISOString();

      this.#setHealth(connectorId, {
        state:
          operation === "disconnect"
            ? CONNECTOR_STATES.DISCONNECTED
            : CONNECTOR_STATES.CONNECTED,
        lastSuccessAt: successAt,
        lastError: null,
      });

      return result;
    } catch (error) {
      const normalized = normalizeConnectorError(error, {
        connectorId,
        operation,
      });

      this.#setHealth(connectorId, {
        state: normalized.retryable
          ? CONNECTOR_STATES.DEGRADED
          : CONNECTOR_STATES.ERROR,
        lastError: {
          code: normalized.code,
          message: normalized.message,
          operation,
          retryable: normalized.retryable,
        },
      });

      throw normalized;
    }
  }

  #setHealth(connectorId, update) {
    this.#health.set(connectorId, {
      ...this.getHealth(connectorId),
      ...update,
    });
  }
}

module.exports = {
  CONNECTOR_STATES,
  STANDARD_CAPABILITIES,
  ConnectorContractError,
  ConnectorOperationError,
  ConnectorRegistry,
  ConnectorManager,
  normalizeConnectorError,
  validateConnectorDefinition,
};
