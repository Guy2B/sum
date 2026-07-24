'use strict';

(function initSignalProvenance(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SIGMA_SIGNAL_PROVENANCE = api;
})(typeof globalThis !== 'undefined' ? globalThis : window, function factory() {
  function asIso(value) {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  function compactObject(value) {
    return Object.fromEntries(
      Object.entries(value || {}).filter(([, item]) =>
        item !== undefined && item !== null && item !== ''
      )
    );
  }

  function inferConnector(signal = {}) {
    return signal.connector ||
      signal.provider ||
      signal.metadata?.connector ||
      signal.metadata?.provider ||
      signal.sourceType ||
      'unknown';
  }

  function inferOriginalObjectType(signal = {}) {
    return signal.originalObjectType ||
      signal.metadata?.originalObjectType ||
      signal.metadata?.objectType ||
      signal.sourceType ||
      'generic';
  }

  function normalize(signal = {}, defaults = {}) {
    const importedAt = asIso(
      signal.importedAt ||
      signal.metadata?.importedAt ||
      defaults.importedAt ||
      new Date()
    );

    const confidence = Number(
      signal.provenance?.confidence ??
      signal.metadata?.confidence ??
      signal.confidence ??
      defaults.confidence ??
      0.8
    );

    return compactObject({
      connector:
        signal.provenance?.connector ||
        inferConnector(signal) ||
        defaults.connector,
      provider:
        signal.provider ||
        signal.provenance?.provider ||
        defaults.provider,
      accountId:
        signal.accountId ||
        signal.provenance?.accountId ||
        defaults.accountId,
      originalObjectType:
        signal.provenance?.originalObjectType ||
        inferOriginalObjectType(signal),
      importedAt,
      observedAt: asIso(
        signal.observedAt ||
        signal.receivedAt ||
        signal.createdAt ||
        signal.startAt ||
        signal.date
      ),
      sourceUrl:
        signal.sourceUrl ||
        signal.provenance?.sourceUrl ||
        signal.metadata?.sourceUrl,
      externalId:
        signal.sourceId ||
        signal.provenance?.externalId ||
        signal.metadata?.externalId,
      confidence: Math.max(0, Math.min(1, confidence)),
      lineage: Array.isArray(signal.provenance?.lineage)
        ? signal.provenance.lineage
        : []
    });
  }

  function attach(signal = {}, defaults = {}) {
    return {
      ...signal,
      provenance: normalize(signal, defaults)
    };
  }

  function summarize(signals = []) {
    return signals.reduce((summary, signal) => {
      const provenance = signal.provenance || normalize(signal);
      const connector = provenance.connector || 'unknown';
      const originalObjectType = provenance.originalObjectType || 'generic';

      summary.byConnector[connector] =
        (summary.byConnector[connector] || 0) + 1;
      summary.byObjectType[originalObjectType] =
        (summary.byObjectType[originalObjectType] || 0) + 1;

      if (!provenance.externalId) summary.missingExternalId += 1;
      if (!provenance.importedAt) summary.missingImportedAt += 1;
      if (!provenance.connector) summary.missingConnector += 1;

      return summary;
    }, {
      total: signals.length,
      byConnector: {},
      byObjectType: {},
      missingExternalId: 0,
      missingImportedAt: 0,
      missingConnector: 0
    });
  }

  return {
    version: '7.1.0',
    normalize,
    attach,
    summarize
  };
});
