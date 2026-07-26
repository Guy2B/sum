export async function syncAllConnectors({
  runtime,
  connectorIds = [],
  context = {},
  concurrency = 2,
} = {}) {
  const queue = [...connectorIds];
  const results = [];

  async function worker() {
    while (queue.length) {
      const connectorId = queue.shift();
      try {
        const result = await runtime.sync(connectorId, context);
        results.push({ connectorId, ok: result.status === 'success', result });
      } catch (error) {
        results.push({ connectorId, ok: false, error: error.message });
      }
    }
  }

  await Promise.all(Array.from({ length: Math.max(1, concurrency) }, worker));
  return {
    results,
    successful: results.filter(item => item.ok).length,
    failed: results.filter(item => !item.ok).length,
    imported: results.reduce((sum, item) => sum + (item.result?.imported?.imported || 0), 0),
  };
}
