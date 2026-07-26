export function createCircuitBreaker({
  failureThreshold = 3,
  resetTimeoutMs = 30000,
} = {}) {
  let failures = 0;
  let state = 'closed';
  let openedAt = 0;

  return {
    async execute(fn, now = Date.now()) {
      if (state === 'open') {
        if (now - openedAt < resetTimeoutMs) throw new Error('circuit open');
        state = 'half-open';
      }
      try {
        const result = await fn();
        failures = 0;
        state = 'closed';
        return result;
      } catch (error) {
        failures += 1;
        if (failures >= failureThreshold) {
          state = 'open';
          openedAt = now;
        }
        throw error;
      }
    },
    status() {
      return { state, failures, openedAt };
    },
  };
}
