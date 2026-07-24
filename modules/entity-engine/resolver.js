'use strict';

(function initEntityResolver(root, factory) {
  const types = typeof module === 'object' && module.exports
    ? require('./types')
    : root.SIGMA_ENTITY_TYPES;
  const api = factory(types);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SIGMA_ENTITY_RESOLVER = api;
})(typeof globalThis !== 'undefined' ? globalThis : window, function factory(types) {
  function aliasKeys(entity = {}) {
    const values = [
      entity.name,
      entity.canonicalName,
      ...(entity.aliases || []),
      entity.metadata?.email,
      entity.metadata?.domain,
      entity.metadata?.url
    ].filter(Boolean);

    return [...new Set(values.map(types.canonical).filter(Boolean))];
  }

  function overlap(left = [], right = []) {
    const set = new Set(left);
    return right.some((value) => set.has(value));
  }

  function compatible(left, right) {
    if (!left || !right) return false;
    if (left.type !== right.type) return false;

    const leftAliases = aliasKeys(left);
    const rightAliases = aliasKeys(right);
    if (overlap(leftAliases, rightAliases)) return true;

    const leftEmail = types.canonical(left.metadata?.email);
    const rightEmail = types.canonical(right.metadata?.email);
    if (leftEmail && rightEmail && leftEmail === rightEmail) return true;

    const leftName = types.canonical(left.name);
    const rightName = types.canonical(right.name);
    if (!leftName || !rightName) return false;

    const short = leftName.length <= rightName.length ? leftName : rightName;
    const long = short === leftName ? rightName : leftName;

    return short.length >= 4 &&
      (long === short || long.startsWith(`${short} `) || long.endsWith(` ${short}`));
  }

  function mergeEntity(base, incoming) {
    const aliases = [...new Set([
      ...(base.aliases || []),
      ...(incoming.aliases || []),
      base.name,
      incoming.name
    ].filter(Boolean))];

    const evidences = [
      ...(base.evidences || []),
      ...(incoming.evidences || [])
    ];

    const confidence = Math.min(
      0.999,
      1 - (1 - Number(base.confidence || 0.5)) *
          (1 - Number(incoming.confidence || 0.5))
    );

    return {
      ...base,
      name: base.name.length >= incoming.name.length
        ? base.name
        : incoming.name,
      aliases,
      confidence,
      updatedAt: new Date().toISOString(),
      metadata: {
        ...(base.metadata || {}),
        ...(incoming.metadata || {})
      },
      evidences
    };
  }

  function resolve(candidates = [], existing = []) {
    const resolved = existing.map((entity) => ({ ...entity }));

    candidates.forEach((candidate) => {
      const matchIndex = resolved.findIndex((entity) =>
        compatible(entity, candidate)
      );

      const normalized = {
        id: candidate.id || types.stableEntityId(
          candidate.type,
          candidate.metadata?.email ||
          candidate.metadata?.domain ||
          candidate.name
        ),
        type: candidate.type,
        name: candidate.name,
        canonicalName: candidate.canonicalName || types.canonical(candidate.name),
        aliases: candidate.aliases || [candidate.name],
        confidence: Number(candidate.confidence || 0.5),
        createdAt: candidate.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: candidate.metadata || {},
        evidences: candidate.evidences || []
      };

      if (matchIndex >= 0) {
        resolved[matchIndex] = mergeEntity(resolved[matchIndex], normalized);
      } else {
        resolved.push(normalized);
      }
    });

    return resolved;
  }

  return {
    version: '8.0.0',
    aliasKeys,
    compatible,
    mergeEntity,
    resolve
  };
});
