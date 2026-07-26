'use strict';
(function (root) {
  const state = {
    providers: {},
    lastErrors: {},
    lastRefresh: null
  };

  function normalizeProvider(value) {
    return String(value || '').trim().toLowerCase();
  }

  function errorMessage(error) {
    return String(
      error?.details?.message ||
      error?.details ||
      error?.error?.message ||
      error?.message ||
      error ||
      'Erreur inconnue'
    );
  }

  function providerCards(provider) {
    const p = normalizeProvider(provider);
    return [...document.querySelectorAll(
      `[data-social-provider="${p}"],[data-provider="${p}"],[data-network="${p}"],#${p}-card,.${p}-card`
    )];
  }

  function setCardState(provider, status, message) {
    const p = normalizeProvider(provider);
    providerCards(p).forEach((card) => {
      card.hidden = false;
      card.style.removeProperty('display');
      card.dataset.connectorStatus = status || 'unknown';

      let target = card.querySelector('[data-connector-status]');
      if (!target) {
        target = document.createElement('p');
        target.dataset.connectorStatus = 'true';
        target.className = 'connector-status';
        card.appendChild(target);
      }

      target.hidden = false;
      target.textContent = message || status || 'État inconnu';
    });
  }

  function reportError(provider, error) {
    const p = normalizeProvider(provider);
    const message = errorMessage(error);
    state.lastErrors[p] = message;
    state.providers[p] = { ...(state.providers[p] || {}), status: 'error', message };
    setCardState(p, 'error', message);
    return message;
  }

  function reportStatus(provider, status, detail) {
    const p = normalizeProvider(provider);
    const message = String(detail || status || 'unknown');
    state.providers[p] = { status, message };
    setCardState(p, status, message);
  }

  async function refresh() {
    state.lastRefresh = new Date().toISOString();

    try {
      const response = await fetch('/api/social/providers', { credentials: 'include' });
      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(body.detail || body.error || `HTTP ${response.status}`);
      }

      const providers = body.providers || body || {};
      Object.entries(providers).forEach(([name, value]) => {
        const configured = Boolean(value?.configured ?? value?.connected);
        const status = configured ? 'configured' : 'not-configured';
        reportStatus(name, status, value?.message || status);
      });

      return body;
    } catch (error) {
      reportError('connectors', error);
      throw error;
    }
  }

  root.addEventListener('sigma:connector-error', (event) => {
    reportError(event.detail?.provider || 'unknown', event.detail?.error || event.detail);
  });

  root.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const text = errorMessage(reason);
    const provider = normalizeProvider(reason?.provider);

    if (provider) {
      reportError(provider, reason);
      return;
    }

    if (/tiktok/i.test(text)) reportError('tiktok', reason);
    if (/linkedin/i.test(text)) reportError('linkedin', reason);
    if (/youtube|google/i.test(text)) reportError('youtube', reason);
  });

  root.SigmaWaveConnectorsV3 = {
    refresh,
    reportError,
    reportStatus,
    diagnostics() {
      return {
        ok: true,
        providers: { ...state.providers },
        lastErrors: { ...state.lastErrors },
        lastRefresh: state.lastRefresh,
        tiktokCardCount: providerCards('tiktok').length,
        linkedinCardCount: providerCards('linkedin').length,
        youtubeCardCount: providerCards('youtube').length
      };
    }
  };

  const start = () => {
    ['tiktok', 'linkedin', 'youtube'].forEach((provider) => {
      providerCards(provider).forEach((card) => {
        card.hidden = false;
        card.style.removeProperty('display');
      });
    });
    refresh().catch(() => {});
  };

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', start, { once: true })
    : start();
})(globalThis);
