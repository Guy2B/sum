export function exportUserData({
  profile = {},
  signals = [],
  decisions = [],
  preferences = {},
  consents = [],
} = {}) {
  return {
    schema: 'sigma-user-export-v1',
    exportedAt: new Date().toISOString(),
    profile,
    signals,
    decisions,
    preferences,
    consents,
  };
}

export function serializeExport(payload) {
  return JSON.stringify(payload, null, 2);
}
