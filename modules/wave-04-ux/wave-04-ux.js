'use strict';

(function (root) {
  const state = {
    lastReconcileAt: null,
    desktopNavReduced: false,
    mobileNavInstalled: false,
    floatingCaptureInstalled: false,
    secondaryCardsCollapsed: 0,
    emptyBadgesHidden: 0,
    touchTargetsAdjusted: 0
  };

  const PRIMARY_LABELS = ['focus', 'plan', 'inbox'];
  const SETTINGS_LABELS = ['réglages', 'reglages', 'settings', 'paramètres', 'parametres'];

  function normalize(value) {
    return String(value || '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  function text(node) {
    return normalize(node && node.textContent);
  }

  function isPrimaryLabel(value) {
    return PRIMARY_LABELS.some(function (label) {
      return value === label || value.indexOf(label) >= 0;
    });
  }

  function isSettingsLabel(value) {
    return SETTINGS_LABELS.some(function (label) {
      return value === label || value.indexOf(label) >= 0;
    });
  }

  function findNavCandidates() {
    return Array.from(document.querySelectorAll(
      'nav a, nav button, [role="navigation"] a, [role="navigation"] button, .sidebar a, .sidebar button'
    ));
  }

  function reduceDesktopNavigation() {
    const items = findNavCandidates();
    if (!items.length) return;

    let retained = 0;

    items.forEach(function (item) {
      const label = text(item);

      if (isPrimaryLabel(label)) {
        item.hidden = false;
        item.removeAttribute('aria-hidden');
        item.dataset.wave04Primary = 'true';
        retained += 1;
        return;
      }

      if (isSettingsLabel(label)) {
        item.dataset.wave04Settings = 'true';
        return;
      }

      if (/déconnexion|logout|profil|profile|compte|account/i.test(label)) {
        return;
      }

      item.dataset.wave04Secondary = 'true';
      item.hidden = true;
      item.setAttribute('aria-hidden', 'true');
    });

    state.desktopNavReduced = retained > 0;
  }

  function findMainHost() {
    return document.querySelector('main, [role="main"], .app-main, .dashboard');
  }

  function collapseSecondaryCards() {
    const host = findMainHost();
    if (!host) return;

    const cards = Array.from(host.querySelectorAll(
      'section, article, .card, [class*="card"], [data-module]'
    )).filter(function (node) {
      return !node.closest('#sigma-wave04-more') &&
        !node.closest('#sigma-wave04-mobile-nav') &&
        node.offsetParent !== null;
    });

    let visibleCount = 0;
    let collapsed = 0;
    let more = document.getElementById('sigma-wave04-more');

    if (!more) {
      more = document.createElement('details');
      more.id = 'sigma-wave04-more';
      more.style.cssText = [
        'margin:1rem 0',
        'padding:.75rem',
        'border:1px solid rgba(127,127,127,.25)',
        'border-radius:12px'
      ].join(';');

      const summary = document.createElement('summary');
      summary.textContent = 'Plus';
      summary.style.cursor = 'pointer';
      more.appendChild(summary);
      host.appendChild(more);
    }

    cards.forEach(function (card) {
      const label = text(card);
      const priority = /focus|priorité|priorite|plan|inbox|capture|agenda|calendrier|calendar|tâche|task/i.test(label);

      if (priority && visibleCount < 5) {
        visibleCount += 1;
        return;
      }

      if (card.parentElement !== more && card !== more) {
        more.appendChild(card);
        collapsed += 1;
      }
    });

    state.secondaryCardsCollapsed = collapsed;
  }

  function hideEmptyBadges() {
    let hidden = 0;

    document.querySelectorAll(
      '.badge, .chip, .counter, [data-count], [class*="badge"], [class*="counter"]'
    ).forEach(function (node) {
      const value = text(node);

      if (/^(0|0 éléments|0 elements|0 items|0 messages|0 posts)$/.test(value)) {
        node.hidden = true;
        node.setAttribute('aria-hidden', 'true');
        hidden += 1;
      }
    });

    state.emptyBadgesHidden = hidden;
  }

  function installMobileNavigation() {
    if (document.getElementById('sigma-wave04-mobile-nav')) {
      state.mobileNavInstalled = true;
      return;
    }

    const nav = document.createElement('nav');
    nav.id = 'sigma-wave04-mobile-nav';
    nav.setAttribute('aria-label', 'Navigation mobile');
    nav.style.cssText = [
      'position:fixed',
      'left:0',
      'right:0',
      'bottom:0',
      'z-index:9998',
      'display:none',
      'grid-template-columns:repeat(4,1fr)',
      'gap:.25rem',
      'padding:.5rem',
      'background:var(--surface, #fff)',
      'border-top:1px solid rgba(127,127,127,.25)',
      'box-shadow:0 -4px 18px rgba(0,0,0,.08)'
    ].join(';');

    const entries = [
      ['Focus', 'focus'],
      ['Plan', 'plan'],
      ['Inbox', 'inbox'],
      ['Réglages', 'settings']
    ];

    entries.forEach(function (entry) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = entry[0];
      button.dataset.wave04Target = entry[1];
      button.style.cssText = [
        'min-height:48px',
        'border:0',
        'background:transparent',
        'border-radius:10px',
        'font:inherit',
        'cursor:pointer'
      ].join(';');

      button.addEventListener('click', function () {
        root.dispatchEvent(new CustomEvent('sigma:navigate', {
          detail: { target: entry[1], source: 'wave-04-mobile-nav' }
        }));

        const candidate = findNavCandidates().find(function (item) {
          const label = text(item);
          return label.indexOf(entry[1]) >= 0 ||
            (entry[1] === 'settings' && isSettingsLabel(label));
        });

        if (candidate) candidate.click();
      });

      nav.appendChild(button);
    });

    document.body.appendChild(nav);

    const style = document.createElement('style');
    style.id = 'sigma-wave04-responsive-style';
    style.textContent = [
      '@media (max-width: 820px) {',
      '  #sigma-wave04-mobile-nav { display:grid !important; }',
      '  body { padding-bottom:78px !important; }',
      '  main, [role="main"], .app-main, .dashboard {',
      '    width:100% !important;',
      '    max-width:100% !important;',
      '    padding-left:12px !important;',
      '    padding-right:12px !important;',
      '  }',
      '  section, article, .card, [class*="card"] {',
      '    max-width:100% !important;',
      '  }',
      '  button, a, input, select, textarea { min-height:44px; }',
      '}'
    ].join('\n');

    document.head.appendChild(style);
    state.mobileNavInstalled = true;
  }

  function installFloatingCapture() {
    if (document.getElementById('sigma-wave04-fab')) {
      state.floatingCaptureInstalled = true;
      return;
    }

    const button = document.createElement('button');
    button.id = 'sigma-wave04-fab';
    button.type = 'button';
    button.textContent = '+';
    button.setAttribute('aria-label', 'Capture rapide');
    button.style.cssText = [
      'position:fixed',
      'right:18px',
      'bottom:88px',
      'z-index:9999',
      'width:56px',
      'height:56px',
      'border-radius:50%',
      'border:0',
      'font-size:28px',
      'cursor:pointer',
      'box-shadow:0 6px 20px rgba(0,0,0,.22)'
    ].join(';');

    button.addEventListener('click', function () {
      const existing = document.querySelector(
        '#sigma-wave03-capture input, [data-quick-capture] input, input[placeholder*="tâche"], input[placeholder*="idée"]'
      );

      if (existing) {
        existing.scrollIntoView({ behavior: 'smooth', block: 'center' });
        existing.focus();
        return;
      }

      root.dispatchEvent(new CustomEvent('sigma:quick-capture-requested', {
        detail: { source: 'wave-04-fab' }
      }));
    });

    document.body.appendChild(button);
    state.floatingCaptureInstalled = true;
  }

  function adjustTouchTargets() {
    let adjusted = 0;

    document.querySelectorAll('button, a, input, select, textarea').forEach(function (node) {
      const rect = node.getBoundingClientRect();
      if (rect.width < 44 || rect.height < 44) {
        node.style.minHeight = '44px';
        node.style.minWidth = node.tagName === 'A' || node.tagName === 'BUTTON' ? '44px' : node.style.minWidth;
        adjusted += 1;
      }
    });

    state.touchTargetsAdjusted = adjusted;
  }

  function reconcile() {
    state.lastReconcileAt = new Date().toISOString();

    reduceDesktopNavigation();
    collapseSecondaryCards();
    hideEmptyBadges();
    installMobileNavigation();
    installFloatingCapture();
    adjustTouchTargets();

    document.documentElement.dataset.sigmaWave04 = 'active';
    return diagnostics();
  }

  function diagnostics() {
    return {
      ok: true,
      generatedAt: new Date().toISOString(),
      viewport: {
        width: root.innerWidth,
        height: root.innerHeight,
        mobile: root.innerWidth <= 820
      },
      state: Object.assign({}, state),
      visibleNavigation: findNavCandidates()
        .filter(function (item) { return !item.hidden; })
        .map(function (item) { return String(item.textContent || '').trim(); })
        .filter(Boolean)
        .slice(0, 20),
      events: [
        'sigma:navigate',
        'sigma:quick-capture-requested'
      ]
    };
  }

  root.SigmaWave04UX = {
    reconcile: reconcile,
    diagnostics: diagnostics
  };

  function start() {
    reconcile();

    let timer = null;
    const observer = new MutationObserver(function () {
      clearTimeout(timer);
      timer = setTimeout(reconcile, 180);
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });

    root.addEventListener('resize', function () {
      clearTimeout(timer);
      timer = setTimeout(reconcile, 120);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})(globalThis);
