export function buildPrivacyReport({
  connectors = [],
  consents = [],
  retainedItems = [],
  auditEvents = [],
} = {}) {
  const activeConsents = consents.filter(item => item.status === 'granted');
  return {
    generatedAt: new Date().toISOString(),
    connectors: {
      total: connectors.length,
      enabled: connectors.filter(item => item.enabled !== false).length,
    },
    permissions: {
      active: activeConsents.length,
      sensitive: activeConsents.filter(item => /write|finance|document/.test(item.capability)).length,
    },
    storage: {
      retainedItems: retainedItems.length,
      bySource: Object.groupBy
        ? Object.groupBy(retainedItems, item => item.source || 'unknown')
        : retainedItems.reduce((acc, item) => {
            const key = item.source || 'unknown';
            (acc[key] ||= []).push(item);
            return acc;
          }, {}),
    },
    auditEvents: auditEvents.length,
  };
}
