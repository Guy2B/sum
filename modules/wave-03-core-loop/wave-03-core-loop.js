'use strict';

(function (root) {
  const state = {
    lastReconcileAt: null,
    prioritiesLimited: 0,
    emptyMetricsHidden: 0,
    focusRegionsTagged: 0,
    quickCaptureInstalled: false,
    dayReviewInstalled: false
  };

  const SELECTORS = {
    priorityItems: [
      '[data-priority-item]',
      '.priority-item',
      '.task-card',
      '[data-task-id]',
      '.today-task',
      '.focus-task'
    ],
    metricCards: [
      '[data-metric]',
      '.metric-card',
      '.stat-card',
      '.kpi-card',
      '[class*="metric"]',
      '[class*="stat"]'
    ],
    dashboardRegions: [
      '[data-dashboard]',
      '.dashboard',
      'main'
    ]
  };

  function all(selectors) {
    return Array.from(document.querySelectorAll(selectors.join(',')));
  }

  function text(node) {
    return String(node && node.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function currentUser() {
    return root.SigmaCloud && root.SigmaCloud.auth
      ? root.SigmaCloud.auth.currentUser
      : null;
  }

  function limitPriorities() {
    const items = all(SELECTORS.priorityItems)
      .filter((node) => !node.closest('[hidden]'))
      .filter((node) => !/terminé|completed|done/i.test(text(node)));

    let hidden = 0;
    items.forEach((node, index) => {
      if (index < 3) {
        node.removeAttribute('data-wave03-overflow');
        return;
      }
      node.hidden = true;
      node.setAttribute('aria-hidden', 'true');
      node.setAttribute('data-wave03-overflow', 'true');
      hidden += 1;
    });

    state.prioritiesLimited = hidden;
  }

  function hideEmptyMetrics() {
    let hidden = 0;

    all(SELECTORS.metricCards).forEach((node) => {
      const value = text(node);
      const empty = /(^|\s)0(\s|$)/.test(value) &&
        !/prochaine|heure|date|aujourd'hui|today/i.test(value);

      if (empty) {
        node.hidden = true;
        node.setAttribute('aria-hidden', 'true');
        node.setAttribute('data-wave03-empty', 'true');
        hidden += 1;
      }
    });

    state.emptyMetricsHidden = hidden;
  }

  function tagFocusRegions() {
    let count = 0;

    all(SELECTORS.dashboardRegions).forEach((region) => {
      if (region.dataset.wave03FocusRegion === 'true') return;
      region.dataset.wave03FocusRegion = 'true';
      count += 1;
    });

    state.focusRegionsTagged = count;
  }

  function installQuickCapture() {
    if (document.getElementById('sigma-wave03-capture')) {
      state.quickCaptureInstalled = true;
      return;
    }

    const host = document.querySelector('[data-dashboard], .dashboard, main');
    if (!host) return;

    const wrapper = document.createElement('section');
    wrapper.id = 'sigma-wave03-capture';
    wrapper.setAttribute('aria-label', 'Capture rapide');
    wrapper.style.cssText = [
      'display:flex',
      'gap:.5rem',
      'align-items:center',
      'margin:1rem 0',
      'padding:.75rem',
      'border:1px solid rgba(127,127,127,.25)',
      'border-radius:12px'
    ].join(';');

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Ajouter une tâche ou une idée';
    input.setAttribute('aria-label', 'Ajouter une tâche ou une idée');
    input.style.cssText = 'flex:1;min-width:0;padding:.7rem;border-radius:8px;border:1px solid rgba(127,127,127,.35)';

    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Ajouter';
    button.style.cssText = 'padding:.7rem 1rem;border-radius:8px;cursor:pointer';

    function submit() {
      const value = input.value.trim();
      if (!value) return;

      root.dispatchEvent(new CustomEvent('sigma:quick-capture', {
        detail: {
          text: value,
          createdAt: new Date().toISOString(),
          uid: currentUser() ? currentUser().uid : null
        }
      }));

      input.value = '';
      button.textContent = 'Ajouté';
      setTimeout(function () { button.textContent = 'Ajouter'; }, 900);
    }

    button.addEventListener('click', submit);
    input.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') submit();
    });

    wrapper.appendChild(input);
    wrapper.appendChild(button);
    host.insertBefore(wrapper, host.firstChild);

    state.quickCaptureInstalled = true;
  }

  function installDayReview() {
    if (document.getElementById('sigma-wave03-review')) {
      state.dayReviewInstalled = true;
      return;
    }

    const host = document.querySelector('[data-dashboard], .dashboard, main');
    if (!host) return;

    const details = document.createElement('details');
    details.id = 'sigma-wave03-review';
    details.style.cssText = 'margin:1rem 0;padding:.75rem;border:1px solid rgba(127,127,127,.25);border-radius:12px';

    const summary = document.createElement('summary');
    summary.textContent = 'Bilan de la journée';
    summary.style.cursor = 'pointer';

    const body = document.createElement('div');
    body.style.cssText = 'display:grid;gap:.5rem;margin-top:.75rem';

    const prompts = [
      'Qu’est-ce qui a avancé aujourd’hui ?',
      'Qu’est-ce qui doit être reporté ?',
      'Quel est le premier pas de demain ?'
    ];

    prompts.forEach(function (prompt, index) {
      const area = document.createElement('textarea');
      area.rows = 2;
      area.placeholder = prompt;
      area.setAttribute('aria-label', prompt);
      area.dataset.reviewIndex = String(index);
      body.appendChild(area);
    });

    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Enregistrer le bilan';
    button.addEventListener('click', function () {
      const answers = Array.from(body.querySelectorAll('textarea')).map(function (area) {
        return area.value.trim();
      });

      root.dispatchEvent(new CustomEvent('sigma:day-review', {
        detail: {
          answers: answers,
          createdAt: new Date().toISOString(),
          uid: currentUser() ? currentUser().uid : null
        }
      }));

      button.textContent = 'Bilan enregistré';
      setTimeout(function () { button.textContent = 'Enregistrer le bilan'; }, 1200);
    });

    body.appendChild(button);
    details.appendChild(summary);
    details.appendChild(body);
    host.appendChild(details);

    state.dayReviewInstalled = true;
  }

  function reconcile() {
    state.lastReconcileAt = new Date().toISOString();
    tagFocusRegions();
    limitPriorities();
    hideEmptyMetrics();
    installQuickCapture();
    installDayReview();

    document.documentElement.dataset.sigmaWave03 = 'active';
    return diagnostics();
  }

  function diagnostics() {
    return {
      ok: true,
      generatedAt: new Date().toISOString(),
      authenticated: Boolean(currentUser()),
      state: Object.assign({}, state),
      visiblePriorityCandidates: all(SELECTORS.priorityItems)
        .filter(function (node) { return !node.hidden; })
        .slice(0, 10)
        .map(function (node) { return text(node).slice(0, 160); }),
      quickCaptureEvent: 'sigma:quick-capture',
      dayReviewEvent: 'sigma:day-review'
    };
  }

  root.SigmaWave03CoreLoop = {
    reconcile: reconcile,
    diagnostics: diagnostics
  };

  function start() {
    reconcile();

    let timer = null;
    const observer = new MutationObserver(function () {
      clearTimeout(timer);
      timer = setTimeout(reconcile, 150);
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})(globalThis);
