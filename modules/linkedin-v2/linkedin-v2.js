'use strict';
(function (root) {
  const state = { configured: null, lastError: null, lastStatus: null };

  function cards() {
    return [...document.querySelectorAll(
      '[data-social-provider="linkedin"],[data-provider="linkedin"],[data-network="linkedin"],#linkedin-card,.linkedin-card'
    )];
  }

  function reveal() {
    cards().forEach(card => {
      card.hidden = false;
      card.removeAttribute('aria-hidden');
      card.style.removeProperty('display');
      card.classList.remove('hidden', 'is-hidden', 'pro-only-hidden');
    });
  }

  function messageOf(error) {
    return String(
      error?.detail ||
      error?.details?.message ||
      error?.error?.message ||
      error?.message ||
      error ||
      'Erreur LinkedIn inconnue'
    );
  }

  function showError(error) {
    const message = messageOf(error);
    state.lastError = message;
    reveal();
    const card = cards()[0];
    if (card) {
      let target = card.querySelector('[data-linkedin-error]');
      if (!target) {
        target = document.createElement('p');
        target.dataset.linkedinError = 'true';
        target.className = 'provider-error linkedin-error';
        card.appendChild(target);
      }
      target.hidden = false;
      target.textContent = message;
    }
    return message;
  }

  async function checkBackend() {
    try {
      const response = await fetch('/api/social/providers', { credentials: 'include' });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.detail || body.error || `HTTP ${response.status}`);
      state.configured = Boolean(body?.providers?.linkedin?.configured);
      state.lastStatus = body;
      if (state.configured === false) showError('LinkedIn OAuth is not configured.');
      return body;
    } catch (error) {
      showError(error);
      throw error;
    }
  }

  root.addEventListener('sigma:linkedin-error', event => showError(event.detail?.error || event.detail));
  root.addEventListener('unhandledrejection', event => {
    const message = messageOf(event.reason);
    if (/linkedin/i.test(message) || /linkedin/i.test(String(event.reason?.provider || ''))) showError(event.reason);
  });

  root.SigmaWaveLinkedInV2 = {
    reveal,
    showError,
    checkBackend,
    diagnostics() {
      reveal();
      return {
        ok: true,
        cardsFound: cards().length,
        cardsVisible: cards().filter(card => {
          const style = getComputedStyle(card);
          return !card.hidden && style.display !== 'none' && style.visibility !== 'hidden';
        }).length,
        backendConfigured: state.configured,
        lastError: state.lastError,
        lastStatus: state.lastStatus
      };
    }
  };

  const start = () => {
    reveal();
    new MutationObserver(reveal).observe(document.documentElement, { childList: true, subtree: true });
    checkBackend().catch(() => {});
  };
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', start, { once: true }) : start();
})(globalThis);
