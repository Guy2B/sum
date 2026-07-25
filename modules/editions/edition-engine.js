function clone(value) {
  return structuredClone(value);
}

function normalizeEdition(input) {
  if (!input || typeof input !== 'object') throw new TypeError('Edition definition is required.');
  const id = String(input.id ?? '').trim();
  if (!id) throw new TypeError('Edition id is required.');
  return Object.freeze({
    id,
    name: String(input.name ?? id),
    modules: Object.freeze([...new Set(input.modules ?? [])].sort()),
    requiredPlan: input.requiredPlan ? String(input.requiredPlan) : null,
    defaults: Object.freeze(clone(input.defaults ?? {})),
    positioning: Object.freeze(clone(input.positioning ?? {})),
  });
}

export class EditionEngine {
  #registry;
  #editions = new Map();

  constructor({ moduleRegistry }) {
    if (!moduleRegistry) throw new TypeError('moduleRegistry is required.');
    this.#registry = moduleRegistry;
  }

  register(definition) {
    const edition = normalizeEdition(definition);
    if (this.#editions.has(edition.id)) throw new Error(`Edition already registered: ${edition.id}`);
    this.#registry.resolve(edition.modules);
    this.#editions.set(edition.id, edition);
    return clone(edition);
  }

  get(id) {
    const edition = this.#editions.get(id);
    return edition ? clone(edition) : null;
  }

  materialize(id, { additionalModules = [], disabledModules = [] } = {}) {
    const edition = this.#editions.get(id);
    if (!edition) throw new Error(`Unknown edition: ${id}`);
    const disabled = new Set(disabledModules);
    const selected = [...edition.modules, ...additionalModules].filter((moduleId) => !disabled.has(moduleId));
    return {
      edition: clone(edition),
      modules: this.#registry.resolve(selected),
    };
  }
}

export { normalizeEdition };
