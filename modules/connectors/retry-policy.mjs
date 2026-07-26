export function calculateRetry({
  attempt = 1,
  baseDelayMs = 1000,
  maxDelayMs = 60_000,
  retryAfterMs = null,
  jitter = 0,
} = {}) {
  if (retryAfterMs !== null) {
    return { retry: true, delayMs: Math.min(maxDelayMs, Math.max(0, retryAfterMs)), source: 'server' };
  }

  const exponential = Math.min(maxDelayMs, baseDelayMs * 2 ** Math.max(0, attempt - 1));
  const jitterAmount = Math.round(exponential * Math.max(0, Math.min(1, jitter)));
  return {
    retry: attempt < 6,
    delayMs: exponential + jitterAmount,
    source: 'exponential-backoff',
  };
}

export function isRetryableError(error = {}) {
  const status = Number(error.status || error.statusCode || 0);
  return status === 429 || status >= 500 || ['ETIMEDOUT', 'ECONNRESET'].includes(error.code);
}
