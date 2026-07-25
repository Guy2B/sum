'use strict';

const REQUIRED = ['normalize', 'validate', 'deriveSignals', 'generateInsights', 'proposeActions', 'explain'];

class DomainAdapterFramework {
  constructor() { this.adapters = new Map(); }

  register(name, adapter) {
    if (!name) throw new Error('Adapter name is required');
    const missing = REQUIRED.filter(method => typeof adapter?.[method] !== 'function');
    if (missing.length) throw new Error(`Adapter ${name} is missing: ${missing.join(', ')}`);
    this.adapters.set(name, adapter);
    return this;
  }

  run(name, rawInput, context = {}) {
    const adapter = this.adapters.get(name);
    if (!adapter) throw new Error(`Unknown domain adapter: ${name}`);
    const normalized = adapter.normalize(rawInput, context);
    const validation = adapter.validate(normalized, context);
    if (validation !== true && validation?.valid !== true) {
      return { domain: name, valid: false, errors: validation?.errors || ['Domain validation failed'] };
    }
    const signals = adapter.deriveSignals(normalized, context);
    const insights = adapter.generateInsights({ normalized, signals }, context);
    const actions = adapter.proposeActions({ normalized, signals, insights }, context).map(action => ({ ...action, requiresApproval: true }));
    return { domain: name, valid: true, normalized, signals, insights, actions, explanation: adapter.explain({ normalized, signals, insights, actions }, context) };
  }
}

module.exports = { DomainAdapterFramework, REQUIRED_DOMAIN_ADAPTER_METHODS: REQUIRED };
