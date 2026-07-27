'use strict';

(function (root) {
  const state = {
    lastReconcileAt: null,
    onboardingInstalled: false,
    victoryCardInstalled: false,
    releaseBadgeInstalled: false,
    consoleErrorsObserved: 0,
    consoleWarningsObserved: 0
  };

  const storage = {
    get(key) {
      try {
        return JSON.parse(localStorage.getItem(key));
      } catch (_) {
        return null;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (_) {}
    }
  };

  function currentUser() {
    return root.SigmaCloud && root.SigmaCloud.auth
      ? root.SigmaCloud.auth.currentUser
      : null;
  }

  function installConsoleObserver() {
    if (root.__sigmaWave05ConsoleObserved) return;
    root.__sigmaWave05ConsoleObserved = true;

    const originalError = console.error.bind(console);
    const originalWarn = console.warn.bind(console);

    console.error = function () {
      state.consoleErrorsObserved += 1;
      return originalError.apply(console, arguments);
    };

    console.warn = function () {
      state.consoleWarningsObserved += 1;
      return originalWarn.apply(console, arguments);
    };
  }

  function installOnboarding() {
    if (document.getElementById('sigma-wave05-onboarding')) {
      state.onboardingInstalled = true;
      return;
    }

    if (storage.get('sigma.wave05.onboarding.completed')) {
      state.onboardingInstalled = true;
      return;
    }

    const host = document.querySelector('main, [role="main"], .dashboard');
    if (!host) return;

    const panel = document.createElement('section');
    panel.id = 'sigma-wave05-onboarding';
    panel.setAttribute('aria-label', 'Démarrage rapide');
    panel.style.cssText = [
      'margin:1rem 0',
      'padding:1rem',
      'border:1px solid rgba(127,127,127,.25)',
      'border-radius:14px'
    ].join(';');

    panel.innerHTML = [
      '<h2 style="margin-top:0">Démarrage rapide</h2>',
      '<p>Trois réponses pour adapter votre journée.</p>',
      '<label>Votre énergie aujourd’hui',
      '<select data-wave05-energy>',
      '<option value="low">Faible</option>',
      '<option value="medium" selected>Moyenne</option>',
      '<option value="high">Élevée</option>',
      '</select></label>',
      '<label>Votre priorité principale',
      '<input data-wave05-priority type="text" placeholder="Ex. Finaliser la proposition"></label>',
      '<label>Votre disponibilité',
      '<select data-wave05-time>',
      '<option value="30">30 minutes</option>',
      '<option value="60" selected>1 heure</option>',
      '<option value="120">2 heures ou plus</option>',
      '</select></label>',
      '<button type="button" data-wave05-save>Commencer</button>'
    ].join('');

    panel.querySelectorAll('label').forEach(function (label) {
      label.style.cssText = 'display:grid;gap:.35rem;margin:.75rem 0';
    });

    panel.querySelectorAll('input,select,button').forEach(function (node) {
      node.style.minHeight = '44px';
    });

    panel.querySelector('[data-wave05-save]').addEventListener('click', function () {
      const result = {
        energy: panel.querySelector('[data-wave05-energy]').value,
        priority: panel.querySelector('[data-wave05-priority]').value.trim(),
        availableMinutes: Number(panel.querySelector('[data-wave05-time]').value),
        uid: currentUser() ? currentUser().uid : null,
        completedAt: new Date().toISOString()
      };

      storage.set('sigma.wave05.onboarding.completed', result);

      root.dispatchEvent(new CustomEvent('sigma:onboarding-completed', {
        detail: result
      }));

      panel.remove();
    });

    host.insertBefore(panel, host.firstChild);
    state.onboardingInstalled = true;
  }

  function installVictoryCard() {
    if (document.getElementById('sigma-wave05-victory')) {
      state.victoryCardInstalled = true;
      return;
    }

    const host = document.querySelector('main, [role="main"], .dashboard');
    if (!host) return;

    const card = document.createElement('section');
    card.id = 'sigma-wave05-victory';
    card.setAttribute('aria-label', 'Victoire du jour');
    card.style.cssText = [
      'margin:1rem 0',
      'padding:1rem',
      'border:1px solid rgba(127,127,127,.25)',
      'border-radius:14px'
    ].join(';');

    const title = document.createElement('h2');
    title.textContent = 'Victoire du jour';
    title.style.marginTop = '0';

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Qu’avez-vous accompli aujourd’hui ?';
    input.setAttribute('aria-label', 'Victoire du jour');
    input.style.cssText = 'width:100%;min-height:44px;box-sizing:border-box';

    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Enregistrer';
    button.style.cssText = 'min-height:44px;margin-top:.75rem';

    button.addEventListener('click', function () {
      const value = input.value.trim();
      if (!value) return;

      const victory = {
        text: value,
        uid: currentUser() ? currentUser().uid : null,
        createdAt: new Date().toISOString()
      };

      storage.set('sigma.wave05.lastVictory', victory);

      root.dispatchEvent(new CustomEvent('sigma:daily-victory', {
        detail: victory
      }));

      button.textContent = 'Victoire enregistrée';
      setTimeout(function () {
        button.textContent = 'Enregistrer';
      }, 1200);
    });

    card.appendChild(title);
    card.appendChild(input);
    card.appendChild(button);
    host.appendChild(card);

    state.victoryCardInstalled = true;
  }

  function installReleaseBadge() {
    if (document.getElementById('sigma-wave05-release')) {
      state.releaseBadgeInstalled = true;
      return;
    }

    const badge = document.createElement('div');
    badge.id = 'sigma-wave05-release';
    badge.textContent = 'Release candidate';
    badge.setAttribute('aria-label', 'Version candidate à la publication');
    badge.style.cssText = [
      'position:fixed',
      'right:12px',
      'top:12px',
      'z-index:9999',
      'padding:.35rem .6rem',
      'border-radius:999px',
      'font-size:12px',
      'background:rgba(0,0,0,.72)',
      'color:white'
    ].join(';');

    document.body.appendChild(badge);
    state.releaseBadgeInstalled = true;
  }

  function scanVisibleTemporaryMarkers() {
    const visibleText = String(document.body && document.body.innerText || '');
    return {
      demo: (visibleText.match(/\bDEMO\b/gi) || []).length,
      beta: (visibleText.match(/\bBETA\b/gi) || []).length,
      alex: (visibleText.match(/\bAlex\b/gi) || []).length
    };
  }

  function reconcile() {
    state.lastReconcileAt = new Date().toISOString();

    installConsoleObserver();
    installOnboarding();
    installVictoryCard();
    installReleaseBadge();

    document.documentElement.dataset.sigmaWave05 = 'active';
    return diagnostics();
  }

  function diagnostics() {
    return {
      ok: true,
      generatedAt: new Date().toISOString(),
      authenticated: Boolean(currentUser()),
      uid: currentUser() ? currentUser().uid : null,
      state: Object.assign({}, state),
      visibleTemporaryMarkers: scanVisibleTemporaryMarkers(),
      onboarding: storage.get('sigma.wave05.onboarding.completed'),
      lastVictory: storage.get('sigma.wave05.lastVictory'),
      events: [
        'sigma:onboarding-completed',
        'sigma:daily-victory'
      ]
    };
  }

  root.SigmaWave05Release = {
    reconcile: reconcile,
    diagnostics: diagnostics
  };

  function start() {
    reconcile();

    let timer = null;
    const observer = new MutationObserver(function () {
      clearTimeout(timer);
      timer = setTimeout(reconcile, 200);
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
