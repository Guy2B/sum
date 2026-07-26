import { hasPermission } from './permission-model.mjs';
import { calculateRetry, isRetryableError } from './retry-policy.mjs';

export async function syncConnector({
  connector,
  adapter,
  grant,
  checkpointStore,
  rateLimitGuard,
  batchSize = 50,
} = {}) {
  if (!connector?.enabled) return { status: 'disabled', imported: 0 };
  if (!hasPermission(grant, 'read-signals')) throw new Error('read-signals permission required');
  if (typeof adapter?.fetchSignals !== 'function') throw new Error('adapter.fetchSignals is required');

  const rate = rateLimitGuard?.consume(connector.id) || { allowed: true };
  if (!rate.allowed) {
    return { status: 'rate-limited', imported: 0, retryAfterMs: rate.retryAfterMs };
  }

  const checkpoint = checkpointStore?.get(connector.id);
  try {
    const response = await adapter.fetchSignals({ checkpoint, batchSize });
    const signals = Array.isArray(response?.signals) ? response.signals : [];
    if (response?.checkpoint && checkpointStore) {
      checkpointStore.set(connector.id, response.checkpoint);
    }
    return {
      status: 'success',
      imported: signals.length,
      signals,
      hasMore: Boolean(response?.hasMore),
      checkpoint: response?.checkpoint || checkpoint,
    };
  } catch (error) {
    if (!isRetryableError(error)) throw error;
    return {
      status: 'retry',
      imported: 0,
      retry: calculateRetry({
        attempt: Number(error.attempt || 1),
        retryAfterMs: error.retryAfterMs ?? null,
      }),
      error: { message: error.message, code: error.code || null, status: error.status || null },
    };
  }
}
