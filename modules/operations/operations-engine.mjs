import { loadRuntimeConfig } from './runtime-config.mjs';
import { createMetricsRegistry } from './metrics-registry.mjs';
import { runHealthChecks } from './health-checks.mjs';
import { evaluateReadiness } from './readiness-gate.mjs';

export function createOperationsEngine(options = {}) {
  const config = loadRuntimeConfig(options.config || {});
  const metrics = createMetricsRegistry();

  return {
    config,
    metrics,
    async assess({ checks = {}, regression, backup, migrations, security } = {}) {
      const health = await runHealthChecks(checks);
      const readiness = evaluateReadiness({ health, regression, backup, migrations, security });
      metrics.gauge('operations.ready', readiness.ready ? 1 : 0);
      metrics.increment('operations.assessments');
      return { health, readiness, metrics: metrics.snapshot() };
    },
  };
}
