'use strict';

(function (root) {
  const CONNECTOR_NAMES = ['youtube', 'google', 'linkedin', 'tiktok', 'twitter', 'x', 'meta', 'facebook', 'instagram'];

  const STATE_LABELS = {
    not_configured: 'Non configuré',
    authorization_required: 'Autorisation requise',
    connected: 'Connecté',
    syncing: 'Synchronisation',
    synchronized: 'Synchronisé',
    expired: 'Connexion expirée',
    error: 'Erreur'
  };

  const state = {
    lastReconcileAt: null,
    cardsInspected: 0,
    cardsNormalized: 0,
    zeroCountersHidden: 0,
    warnings: []
  };

  function normalizeText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function detectConnectorName(node) {
    const text = normalizeText(node.textContent).toLowerCase();
    return CONNECTOR_NAMES.find((name) => text.includes(name)) || null;
  }

  function hasSynchronizationEvidence(node) {
    const text = normalizeText(node.textContent);
    return /derni[eè]re synchronisation|last sync|synchronis[eé] le|import[eé]s?\s*:\s*[1-9]|[1-9]\d*\s+(éléments|items|contenus|posts|vidéos)/i.test(text);
  }

  function hasErrorEvidence(node) {
    const text = normalizeText(node.textContent);
    return /erreur|error|échec|failed|token expiré|expired|autorisation requise|reconnecter/i.test(text);
  }

  function inferState(node) {
    const text = normalizeText(node.textContent);

    if (hasErrorEvidence(node)) {
      if (/expiré|expired/i.test(text)) return 'expired';
      if (/autorisation requise|reconnecter/i.test(text)) return 'authorization_required';
      return 'error';
    }

    if (/synchronisation en cours|syncing|chargement/i.test(text)) return 'syncing';
    if (hasSynchronizationEvidence(node)) return 'synchronized';
    if (/connecté|connected/i.test(text)) return 'connected';
    if (/configurer|non configuré|not configured/i.test(text)) return 'not_configured';

    return 'authorization_required';
  }

  function findConnectorCards() {
    const selectors = [
      '[data-connector]',
      '[data-provider]',
      '.connector-card',
      '.social-card',
      '.integration-card',
      'article',
      '[role="listitem"]'
    ];

    const seen = new Set();
    const cards = [];

    document.querySelectorAll(selectors.join(',')).forEach((node) => {
      if (seen.has(node)) return;
      const connector = detectConnectorName(node);
      if (!connector) return;
      seen.add(node);
      cards.push({ node, connector });
    });

    return cards;
  }

  function findStatusElement(card) {
    return card.querySelector(
      '[data-status], .status, .badge, .chip, [class*="status"], [class*="badge"], [class*="chip"]'
    );
  }

  function normalizeCard(card, connector) {
    const inferred = inferState(card);
    const statusNode = findStatusElement(card);

    card.dataset.sigmaConnector = connector;
    card.dataset.sigmaConnectorState = inferred;

    if (statusNode) {
      const current = normalizeText(statusNode.textContent);
      const misleadingConnected = /connecté|connected/i.test(current) && inferred !== 'synchronized';

      if (misleadingConnected) {
        statusNode.textContent = STATE_LABELS[inferred];
        statusNode.setAttribute('title', 'État normalisé par la vague 2 selon les preuves visibles de synchronisation.');
        state.cardsNormalized += 1;
      }
    }

    if (inferred === 'connected' && !hasSynchronizationEvidence(card)) {
      card.dataset.sigmaNeedsSyncEvidence = 'true';
      state.warnings.push({
        connector,
        warning: 'Connecteur affiché connecté sans date ni volume de synchronisation visible.'
      });
    }

    card.querySelectorAll('[data-count], .count, .counter, [class*="count"]').forEach((counter) => {
      const text = normalizeText(counter.textContent);
      if (/^0$|^0\s+(éléments|items|posts|contenus|messages|vidéos)$/i.test(text)) {
        counter.hidden = true;
        counter.setAttribute('aria-hidden', 'true');
        state.zeroCountersHidden += 1;
      }
    });

    return inferred;
  }

  function reconcile() {
    state.lastReconcileAt = new Date().toISOString();
    state.cardsInspected = 0;
    state.cardsNormalized = 0;
    state.zeroCountersHidden = 0;
    state.warnings = [];

    const results = findConnectorCards().map(({ node, connector }) => {
      state.cardsInspected += 1;
      return {
        connector,
        inferredState: normalizeCard(node, connector),
        hasSyncEvidence: hasSynchronizationEvidence(node)
      };
    });

    return results;
  }

  function diagnostics() {
    const cards = findConnectorCards().map(({ node, connector }) => ({
      connector,
      state: node.dataset.sigmaConnectorState || inferState(node),
      hasSyncEvidence: hasSynchronizationEvidence(node),
      text: normalizeText(node.textContent).slice(0, 240)
    }));

    return {
      ok: true,
      generatedAt: new Date().toISOString(),
      state: { ...state },
      cards,
      requiredStates: Object.keys(STATE_LABELS)
    };
  }

  root.SigmaWave02Connectors = {
    reconcile,
    diagnostics,
    inferState,
    hasSynchronizationEvidence,
    STATE_LABELS: { ...STATE_LABELS }
  };

  function start() {
    reconcile();

    const observer = new MutationObserver(() => {
      clearTimeout(start.timer);
      start.timer = setTimeout(reconcile, 100);
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})(globalThis);
