import { createConnectorDefinition } from './connector-contract.mjs';
import { createPermissionGrant } from './permission-model.mjs';
import { createCheckpointStore } from './checkpoint-store.mjs';
import { createRateLimitGuard } from './rate-limit-guard.mjs';
import { createAdapterRegistry } from './adapter-registry.mjs';
import { syncConnector } from './sync-engine.mjs';
import { importConnectorSignals } from './signal-import-pipeline.mjs';
import { evaluateConnectorHealth } from './health-monitor.mjs';

export function createConnectorRuntime(options = {}) {
  const definitions = new Map();
  const grants = new Map();
  const registry = createAdapterRegistry();
  const checkpoints = createCheckpointStore(options.checkpoints);
  const rateLimitGuard = createRateLimitGuard(options.rateLimit);

  return {
    install(definitionInput, adapter, requestedPermissions = ['read-signals']) {
      const definition = createConnectorDefinition(definitionInput);
      definitions.set(definition.id, definition);
      grants.set(definition.id, createPermissionGrant(definition, requestedPermissions));
      registry.register(definition.id, adapter);
      return { definition, grant: grants.get(definition.id) };
    },
    grant(connectorId) {
      return grants.get(connectorId) || null;
    },
    async sync(connectorId, context = {}) {
      const connector = definitions.get(connectorId);
      const adapter = registry.get(connectorId);
      if (!connector || !adapter) throw new Error(`connector not installed: ${connectorId}`);

      const syncResult = await syncConnector({
        connector,
        adapter,
        grant: grants.get(connectorId),
        checkpointStore: checkpoints,
        rateLimitGuard,
      });

      const imported = syncResult.status === 'success'
        ? importConnectorSignals(syncResult.signals, context)
        : null;

      return {
        ...syncResult,
        imported,
        health: evaluateConnectorHealth({
          lastSuccessAt: syncResult.status === 'success' ? new Date().toISOString() : null,
          consecutiveFailures: syncResult.status === 'success' ? 0 : 1,
          lagMinutes: 0,
        }),
      };
    },
    list() {
      return [...definitions.values()];
    },
    checkpoint(connectorId) {
      return checkpoints.get(connectorId);
    },
  };
}
