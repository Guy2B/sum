"use strict";

function redactSecrets(value) {
  if (Array.isArray(value)) return value.map(redactSecrets);
  if (!value || typeof value !== "object") return value;
  const secretKeys = /token|secret|authorization|password|code_verifier/i;
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      secretKeys.test(key) ? "[REDACTED]" : redactSecrets(item),
    ]),
  );
}

function withTimeout(promise, timeoutMs, label = "connector operation") {
  let timer;
  return Promise.race([
    Promise.resolve(promise),
    new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms.`)), timeoutMs);
    }),
  ]).finally(() => clearTimeout(timer));
}

async function retry(operation, options = {}) {
  const attempts = options.attempts || 3;
  const shouldRetry = options.shouldRetry || ((error) => Boolean(error?.retryable));
  const delay = options.delay || (async () => {});
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation({ attempt });
    } catch (error) {
      lastError = error;
      if (attempt === attempts || !shouldRetry(error)) throw error;
      await delay(attempt, error);
    }
  }
  throw lastError;
}

class CircuitBreaker {
  constructor({ failureThreshold = 3, cooldownMs = 30000, clock = () => Date.now() } = {}) {
    this.failureThreshold = failureThreshold;
    this.cooldownMs = cooldownMs;
    this.clock = clock;
    this.failures = 0;
    this.openedAt = null;
  }

  canRun() {
    if (this.openedAt === null) return true;
    if (this.clock() - this.openedAt >= this.cooldownMs) {
      this.openedAt = null;
      this.failures = 0;
      return true;
    }
    return false;
  }

  recordSuccess() {
    this.failures = 0;
    this.openedAt = null;
  }

  recordFailure() {
    this.failures += 1;
    if (this.failures >= this.failureThreshold) this.openedAt = this.clock();
  }

  async execute(operation) {
    if (!this.canRun()) throw new Error("Connector circuit is open.");
    try {
      const result = await operation();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }
}

module.exports = { redactSecrets, withTimeout, retry, CircuitBreaker };
