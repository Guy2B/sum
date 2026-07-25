const VALID_STATES = new Set(['active', 'preview', 'deprecated', 'disabled']);

function clone(value) {
  return structuredClone(value);
}

function normalizeModule(input) {
  if (!input || typeof input !== 'object') throw new TypeError('Module definition is required.');
  const id = String(input.id ?? '').trim();
  if (!id) throw new TypeError('Module id is required.');
  const state = input.state ?? 'active';
  if (!VALID_STATES.has(state)) throw new RangeError(`Unsupported module state: ${state}`);

  return Object.freeze({
    id,
    name: String(input.name ?? id),
    version: String(input.version ?? '1.0.0'),
    state,
    capabilities: Object.freeze([...new Set(input.capabilities ?? [])].sort()),
    dependencies: Object.freeze([...new Set(input.dependencies ?? [])].sort()),
    privacyDomains: Object.freeze([...new Set(input.privacyDomains ?? [])].sort()),
    defaultEnabled: input.defaultEnabled === true,
    metadata: Object.freeze(clone(input.metadata ?? {})),
  });
}

export class ModuleRegistry {
  #modules = new Map();

  register(definition) {
    const module = normalizeModule(definition);
    if (this.#modules.has(module.id)) throw new Error(`Module already registered: ${module.id}`);
    this.#modules.set(module.id, module);
    return clone(module);
  }

  get(id) {
    const module = this.#modules.get(id);
    return module ? clone(module) : null;
  }

  list({ state } = {}) {
    return [...this.#modules.values()]
      .filter((module) => !state || module.state === state)
      .sort((a, b) => a.id.localeCompare(b.id))
      .map(clone);
  }

  resolve(ids) {
    const requested = [...new Set(ids ?? [])];
    const resolved = new Set();
    const visiting = new Set();

    const visit = (id) => {
      const module = this.#modules.get(id);
      if (!module) throw new Error(`Unknown module: ${id}`);
      if (module.state === 'disabled') throw new Error(`Module is disabled: ${id}`);
      if (visiting.has(id)) throw new Error(`Circular module dependency detected at: ${id}`);
      if (resolved.has(id)) return;
      visiting.add(id);
      for (const dependency of module.dependencies) visit(dependency);
      visiting.delete(id);
      resolved.add(id);
    };

    for (const id of requested) visit(id);
    return [...resolved].map((id) => this.get(id));
  }
}

export { normalizeModule };
