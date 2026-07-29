"use strict";

function stableKey(signal) {
  return [
    signal.type || "unknown",
    signal.entityId || signal.id || "",
    signal.timestamp || signal.receivedAt || signal.start || "",
  ].join(":");
}

function normalizeSignal(signal, source) {
  return {
    id: signal.id || stableKey(signal),
    type: signal.type || "unknown",
    source: signal.source || source || "unknown",
    entityId: signal.entityId || null,
    timestamp: signal.timestamp || signal.receivedAt || signal.start || null,
    importance: signal.importance || "normal",
    confidence: Number.isFinite(signal.confidence) ? signal.confidence : 1,
    payload: signal.payload || signal,
  };
}

function fuseSignals(signalGroups, options = {}) {
  const seen = new Set();
  const fused = [];
  for (const group of signalGroups || []) {
    const source = group.source || "unknown";
    for (const raw of group.items || []) {
      const signal = normalizeSignal(raw, source);
      const key = options.keyFn ? options.keyFn(signal) : stableKey(signal);
      if (seen.has(key)) continue;
      seen.add(key);
      fused.push(signal);
    }
  }
  fused.sort((a, b) => String(b.timestamp || "").localeCompare(String(a.timestamp || "")));
  return fused;
}

function groupSignalsByEntity(signals) {
  return signals.reduce((groups, signal) => {
    const key = signal.entityId || "unassigned";
    (groups[key] ||= []).push(signal);
    return groups;
  }, {});
}

module.exports = { fuseSignals, normalizeSignal, stableKey, groupSignalsByEntity };
