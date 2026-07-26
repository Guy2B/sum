export async function runHealthChecks(checks = {}) {
  const results = {};
  for (const [name, check] of Object.entries(checks)) {
    const started = Date.now();
    try {
      const detail = await check();
      results[name] = { ok: detail?.ok !== false, latencyMs: Date.now() - started, detail };
    } catch (error) {
      results[name] = { ok: false, latencyMs: Date.now() - started, error: error.message };
    }
  }
  const healthy = Object.values(results).every(item => item.ok);
  return { healthy, status: healthy ? 'healthy' : 'degraded', results };
}
