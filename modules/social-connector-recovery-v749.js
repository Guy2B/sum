'use strict';
// Sigma Release 735–749 — additive connector recovery diagnostics.
(() => {
  const PROVIDERS = ['linkedin', 'x', 'tiktok', 'youtube', 'facebook', 'instagram'];

  function apiBase() {
    return String(window.SUM_CONFIG?.socialApiBaseUrl || window.SIGMA_ONLINE_CONFIG?.socialApiBaseUrl || '').replace(/\/$/, '');
  }

  async function request(path) {
    const base = apiBase();
    if (!base) throw new Error('socialApiBaseUrl is not configured.');
    const response = await fetch(`${base}${path}`, { credentials: 'include' });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || payload.detail || `HTTP ${response.status}`);
    return payload;
  }

  async function diagnose() {
    const report = {
      release: 749,
      generatedAt: new Date().toISOString(),
      apiBase: apiBase(),
      configured: false,
      health: null,
      providers: {},
      accounts: [],
      errors: []
    };

    if (!report.apiBase) {
      report.errors.push('socialApiBaseUrl is empty; the existing Social Hub remains in explicit demo mode.');
      return report;
    }

    try {
      report.health = await request('/health');
      report.configured = Boolean(report.health?.ok);
    } catch (error) {
      report.errors.push(`Health: ${error.message}`);
    }

    try {
      const payload = await request('/api/social/providers');
      report.providers = payload.providers || {};
    } catch (error) {
      report.errors.push(`Providers: ${error.message}`);
    }

    try {
      const payload = await request('/api/social/accounts');
      report.accounts = Array.isArray(payload.accounts) ? payload.accounts : [];
    } catch (error) {
      report.errors.push(`Accounts: ${error.message}`);
    }

    for (const provider of PROVIDERS) {
      if (!Object.prototype.hasOwnProperty.call(report.providers, provider)) {
        report.providers[provider] = { configured: false, capability: 'not-reported' };
      }
    }
    return report;
  }

  window.SigmaSocialConnectorRecoveryV749 = Object.freeze({
    release: 749,
    providers: [...PROVIDERS],
    apiBase,
    diagnose
  });

  window.dispatchEvent(new CustomEvent('sigma:social-connector-recovery-ready', {
    detail: { release: 749, providers: [...PROVIDERS] }
  }));
})();
