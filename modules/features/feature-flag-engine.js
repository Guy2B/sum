function clone(value) {
  return structuredClone(value);
}

export class FeatureFlagEngine {
  #definitions = new Map();
  #overrides = new Map();

  define({ key, defaultValue = false, rules = [] }) {
    const normalizedKey = String(key ?? '').trim();
    if (!normalizedKey) throw new TypeError('Feature key is required.');
    if (this.#definitions.has(normalizedKey)) throw new Error(`Feature already defined: ${normalizedKey}`);
    const definition = Object.freeze({ key: normalizedKey, defaultValue: Boolean(defaultValue), rules: clone(rules) });
    this.#definitions.set(normalizedKey, definition);
    return clone(definition);
  }

  setOverride(scope, key, value) {
    if (!this.#definitions.has(key)) throw new Error(`Unknown feature: ${key}`);
    const scopeKey = String(scope ?? '').trim();
    if (!scopeKey) throw new TypeError('Override scope is required.');
    this.#overrides.set(`${scopeKey}:${key}`, Boolean(value));
  }

  evaluate(key, context = {}) {
    const definition = this.#definitions.get(key);
    if (!definition) throw new Error(`Unknown feature: ${key}`);
    for (const scope of [context.userId, context.workspaceId, context.edition, context.plan].filter(Boolean)) {
      const overrideKey = `${scope}:${key}`;
      if (this.#overrides.has(overrideKey)) {
        return { key, enabled: this.#overrides.get(overrideKey), reason: `override:${scope}` };
      }
    }
    for (const rule of definition.rules) {
      const matches = Object.entries(rule.when ?? {}).every(([field, expected]) => context[field] === expected);
      if (matches) return { key, enabled: Boolean(rule.value), reason: rule.reason ?? 'rule' };
    }
    return { key, enabled: definition.defaultValue, reason: 'default' };
  }
}
