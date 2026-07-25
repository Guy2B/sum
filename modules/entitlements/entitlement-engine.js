function clone(value) {
  return structuredClone(value);
}

export class EntitlementEngine {
  #moduleRegistry;
  #editionEngine;
  #licenseCatalog;
  #featureFlags;

  constructor({ moduleRegistry, editionEngine, licenseCatalog, featureFlags }) {
    if (!moduleRegistry || !editionEngine || !licenseCatalog || !featureFlags) {
      throw new TypeError('All platform engines are required.');
    }
    this.#moduleRegistry = moduleRegistry;
    this.#editionEngine = editionEngine;
    this.#licenseCatalog = licenseCatalog;
    this.#featureFlags = featureFlags;
  }

  resolve({ editionId, planId, addOns = [], disabledModules = [], context = {} }) {
    const plan = this.#licenseCatalog.getPlan(planId);
    if (!plan) throw new Error(`Unknown plan: ${planId}`);
    const edition = this.#editionEngine.get(editionId);
    if (!edition) throw new Error(`Unknown edition: ${editionId}`);
    if (edition.requiredPlan && edition.requiredPlan !== planId) {
      throw new Error(`Edition ${editionId} requires plan ${edition.requiredPlan}`);
    }

    const permitted = new Set([...plan.includedModules, ...addOns]);
    const requested = edition.modules.filter((moduleId) => permitted.has(moduleId));
    const materialized = this.#editionEngine.materialize(editionId, {
      additionalModules: addOns,
      disabledModules: edition.modules.filter((id) => !requested.includes(id)).concat(disabledModules),
    });

    const modules = materialized.modules.filter((module) => permitted.has(module.id) && !disabledModules.includes(module.id));
    const features = {};
    for (const module of modules) {
      for (const capability of module.capabilities) {
        try {
          features[capability] = this.#featureFlags.evaluate(capability, {
            ...context,
            edition: editionId,
            plan: planId,
          });
        } catch {
          features[capability] = { key: capability, enabled: true, reason: 'module-capability' };
        }
      }
    }

    return clone({
      edition,
      plan,
      modules,
      features,
      limits: plan.limits,
      decision: {
        allowed: modules.map((module) => module.id),
        denied: edition.modules.filter((moduleId) => !modules.some((module) => module.id === moduleId)),
      },
    });
  }
}
