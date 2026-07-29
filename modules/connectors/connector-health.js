"use strict";

const HEALTH = Object.freeze({
  HEALTHY: "healthy",
  DEGRADED: "degraded",
  UNAVAILABLE: "unavailable",
  UNKNOWN: "unknown",
});

function calculateHealth(record, now = Date.now()) {
  if (!record) return HEALTH.UNKNOWN;
  if (record.disabled) return HEALTH.UNAVAILABLE;
  if (record.lastError && record.consecutiveFailures >= 3) return HEALTH.UNAVAILABLE;
  if (record.lastError || record.consecutiveFailures > 0) return HEALTH.DEGRADED;
  if (record.lastSuccessAt && now - record.lastSuccessAt <= (record.staleAfterMs || 3600000)) {
    return HEALTH.HEALTHY;
  }
  return HEALTH.UNKNOWN;
}

class ConnectorHealthRegistry {
  constructor({ clock = () => Date.now(), staleAfterMs = 3600000 } = {}) {
    this.clock = clock;
    this.staleAfterMs = staleAfterMs;
    this.records = new Map();
  }

  recordSuccess(id, details = {}) {
    const current = this.records.get(id) || {};
    const next = {
      ...current,
      ...details,
      lastSuccessAt: this.clock(),
      lastError: null,
      consecutiveFailures: 0,
      staleAfterMs: details.staleAfterMs || current.staleAfterMs || this.staleAfterMs,
    };
    this.records.set(id, next);
    return this.get(id);
  }

  recordFailure(id, error) {
    const current = this.records.get(id) || {};
    this.records.set(id, {
      ...current,
      lastFailureAt: this.clock(),
      lastError: error?.message || String(error),
      consecutiveFailures: (current.consecutiveFailures || 0) + 1,
      staleAfterMs: current.staleAfterMs || this.staleAfterMs,
    });
    return this.get(id);
  }

  get(id) {
    const record = this.records.get(id) || null;
    return { id, status: calculateHealth(record, this.clock()), record };
  }

  snapshot() {
    return [...this.records.keys()].map((id) => this.get(id));
  }
}

module.exports = { HEALTH, calculateHealth, ConnectorHealthRegistry };
