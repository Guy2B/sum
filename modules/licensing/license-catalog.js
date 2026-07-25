function clone(value) {
  return structuredClone(value);
}

function normalizePlan(input) {
  if (!input || typeof input !== 'object') throw new TypeError('Plan definition is required.');
  const id = String(input.id ?? '').trim();
  if (!id) throw new TypeError('Plan id is required.');
  const price = Number(input.price ?? 0);
  if (!Number.isFinite(price) || price < 0) throw new RangeError('Plan price must be a non-negative number.');
  return Object.freeze({
    id,
    name: String(input.name ?? id),
    currency: String(input.currency ?? 'EUR').toUpperCase(),
    billingPeriod: input.billingPeriod ?? 'month',
    price,
    includedModules: Object.freeze([...new Set(input.includedModules ?? [])].sort()),
    limits: Object.freeze(clone(input.limits ?? {})),
    commercial: Object.freeze(clone(input.commercial ?? {})),
  });
}

export class LicenseCatalog {
  #plans = new Map();

  addPlan(definition) {
    const plan = normalizePlan(definition);
    if (this.#plans.has(plan.id)) throw new Error(`Plan already exists: ${plan.id}`);
    this.#plans.set(plan.id, plan);
    return clone(plan);
  }

  getPlan(id) {
    const plan = this.#plans.get(id);
    return plan ? clone(plan) : null;
  }

  compare(leftId, rightId) {
    const left = this.#plans.get(leftId);
    const right = this.#plans.get(rightId);
    if (!left || !right) throw new Error('Both plans must exist.');
    return {
      addedModules: right.includedModules.filter((id) => !left.includedModules.includes(id)),
      removedModules: left.includedModules.filter((id) => !right.includedModules.includes(id)),
      limitChanges: Object.fromEntries(
        [...new Set([...Object.keys(left.limits), ...Object.keys(right.limits)])]
          .filter((key) => left.limits[key] !== right.limits[key])
          .map((key) => [key, { from: left.limits[key] ?? null, to: right.limits[key] ?? null }]),
      ),
    };
  }
}

export { normalizePlan };
