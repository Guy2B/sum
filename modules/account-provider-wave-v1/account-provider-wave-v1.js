'use strict';

(function accountProviderWaveV1(root) {
  const ADMIN_UID = 'Rjsjx7Q3VcVyDqk86t9kEhp2GGJ2';
  const GOOGLE_SCOPE_KEY = 'sigma:google:granted-scopes:v1';
  const REQUIRED_YOUTUBE_SCOPES = [
    'https://www.googleapis.com/auth/youtube.readonly'
  ];

  const state = {
    release: 1,
    adminUid: ADMIN_UID,
    lastLinkedInError: null,
    lastGoogleScopes: []
  };

  function firebaseUser() {
    return root.SigmaCloud?.auth?.currentUser ||
      root.SigmaCloud?.user ||
      root.SigmaFirebaseRuntimeAdapterV1?.currentUser?.() ||
      null;
  }

  function cleanName(value) {
    const text = String(value || '').trim();
    return /^alex$/i.test(text) ? '' : text;
  }

  function preferredDisplayName() {
    const user = firebaseUser();
    return cleanName(user?.displayName) ||
      cleanName(user?.email?.split('@')[0]) ||
      '';
  }

  function replaceAlexText() {
    const name = preferredDisplayName();
    if (!name) return;

    const selectors = [
      '[data-user-name]',
      '#account-name',
      '#profile-name',
      '#user-display-name',
      '.user-name',
      '.profile-name',
      'input[name="name"]'
    ];

    selectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((node) => {
        if (node instanceof HTMLInputElement) {
          if (!cleanName(node.value) || /^alex$/i.test(node.value.trim())) node.value = name;
          return;
        }

        const current = String(node.textContent || '').trim();
        if (!current || /^alex$/i.test(current)) node.textContent = name;
      });
    });

    document.querySelectorAll('body *').forEach((node) => {
      if (node.children.length || !/^alex$/i.test(String(node.textContent || '').trim())) return;
      node.textContent = name;
    });

    try {
      for (let index = 0; index < localStorage.length; index += 1) {
        const key = localStorage.key(index);
        if (!key) continue;
        const raw = localStorage.getItem(key);
        if (raw === 'Alex' || raw === '"Alex"') localStorage.removeItem(key);
      }
    } catch (_) {}
  }

  function isAdminPro() {
    return firebaseUser()?.uid === ADMIN_UID;
  }

  function installProOverride() {
    root.SigmaAccountProviderWaveV1 = Object.assign(root.SigmaAccountProviderWaveV1 || {}, {
      isAdminPro,
      isPro() {
        if (isAdminPro()) return true;
        const candidates = [
          root.SigmaEdition?.isPro?.(),
          root.SigmaEntitlements?.isPro?.(),
          root.SigmaLicense?.isPro?.(),
          root.SigmaCloud?.profile?.edition === 'pro',
          root.SigmaCloud?.profile?.plan === 'pro'
        ];
        return candidates.some(Boolean);
      },
      edition() {
        return isAdminPro() ? 'pro' :
          root.SigmaCloud?.profile?.edition ||
          root.SigmaCloud?.profile?.plan ||
          'free';
      }
    });

    const admin = isAdminPro();
    document.documentElement.toggleAttribute('data-sigma-admin-pro', admin);
    if (admin) {
      document.documentElement.dataset.sigmaEdition = 'pro';
      root.dispatchEvent(new CustomEvent('sigma:edition-resolved', {
        detail: { edition: 'pro', plan: 'pro', source: 'admin-uid', uid: ADMIN_UID }
      }));
    }
  }

  function parseScopes(value) {
    if (Array.isArray(value)) return value.flatMap(parseScopes);
    if (!value) return [];
    return String(value).split(/[\s,]+/).map((scope) => scope.trim()).filter(Boolean);
  }

  function storedScopes() {
    try {
      return parseScopes(JSON.parse(localStorage.getItem(GOOGLE_SCOPE_KEY) || '[]'));
    } catch (_) {
      return [];
    }
  }

  function saveScopes(scopes) {
    const merged = [...new Set([...storedScopes(), ...parseScopes(scopes)])];
    state.lastGoogleScopes = merged;
    try { localStorage.setItem(GOOGLE_SCOPE_KEY, JSON.stringify(merged)); } catch (_) {}
    return merged;
  }

  function hasGoogleScopes(scopes) {
    const granted = new Set(storedScopes());
    return parseScopes(scopes).every((scope) => granted.has(scope));
  }

  function installGoogleScopeGuard() {
    root.SigmaGoogleScopeGuardV1 = {
      requiredYouTubeScopes: [...REQUIRED_YOUTUBE_SCOPES],
      grantedScopes: storedScopes,
      remember: saveScopes,
      has: hasGoogleScopes,
      shouldRequest(scopes) {
        return !hasGoogleScopes(scopes);
      }
    };

    root.addEventListener('sigma:google-scopes-granted', (event) => {
      saveScopes(event.detail?.scopes || event.detail?.scope);
    });

    root.addEventListener('message', (event) => {
      const data = event?.data;
      if (!data || typeof data !== 'object') return;
      if (data.type === 'sigma:google-scopes-granted') {
        saveScopes(data.scopes || data.scope);
      }
    });
  }

  function findGoogleAuthorizationButton() {
    return document.querySelector(
      '[data-google-authorize], [data-provider="google"], [data-mail-provider="google"], ' +
      '#google-authorize, #google-connect, #mail-google-connect'
    );
  }

  function authorizeGoogleForYouTube() {
    if (hasGoogleScopes(REQUIRED_YOUTUBE_SCOPES)) {
      root.dispatchEvent(new CustomEvent('sigma:youtube-google-ready', {
        detail: { scopes: REQUIRED_YOUTUBE_SCOPES, reused: true }
      }));
      return true;
    }

    root.dispatchEvent(new CustomEvent('sigma:google-authorization-requested', {
      detail: { provider: 'youtube', scopes: REQUIRED_YOUTUBE_SCOPES }
    }));

    const button = findGoogleAuthorizationButton();
    if (button) {
      button.click();
      return true;
    }
    return false;
  }

  function patchYouTubeProfessionalGate() {
    const nodes = document.querySelectorAll('button, a, [role="button"], h1, h2, h3, p, span');
    nodes.forEach((node) => {
      const text = String(node.textContent || '').trim();
      if (!/professionnel requis|professional required/i.test(text)) return;

      if (node.matches('button, a, [role="button"]')) {
        node.textContent = 'Autoriser avec Google';
        node.removeAttribute('disabled');
        node.setAttribute('data-google-authorize-youtube', 'true');
      } else {
        node.textContent = 'Autorisez YouTube avec votre compte Google.';
      }
    });

    document.querySelectorAll('[data-google-authorize-youtube]').forEach((button) => {
      if (button.dataset.sigmaWaveBound === '1') return;
      button.dataset.sigmaWaveBound = '1';
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        authorizeGoogleForYouTube();
      }, true);
    });
  }

  function linkedInCards() {
    return [...document.querySelectorAll(
      '[data-social-provider="linkedin"], [data-provider="linkedin"], ' +
      '[data-network="linkedin"], #linkedin-card, .linkedin-card'
    )];
  }

  function showLinkedInCards() {
    linkedInCards().forEach((card) => {
      card.hidden = false;
      card.style.removeProperty('display');
      card.removeAttribute('aria-hidden');
      card.classList.remove('hidden', 'is-hidden', 'pro-only-hidden');
    });
  }

  function backendError(error) {
    return error?.details?.message ||
      error?.details ||
      error?.message ||
      error?.error?.message ||
      String(error || 'Erreur LinkedIn inconnue');
  }

  function displayLinkedInError(error) {
    const message = backendError(error);
    state.lastLinkedInError = message;
    showLinkedInCards();

    const card = linkedInCards()[0];
    if (!card) return message;

    let target = card.querySelector('[data-linkedin-error], .linkedin-error, .provider-error, .form-message');
    if (!target) {
      target = document.createElement('p');
      target.className = 'form-message linkedin-error';
      target.setAttribute('data-linkedin-error', 'true');
      card.appendChild(target);
    }
    target.hidden = false;
    target.textContent = message;
    return message;
  }

  function installLinkedInErrorBridge() {
    root.SigmaLinkedInErrorBridgeV1 = {
      show: displayLinkedInError,
      reveal: showLinkedInCards,
      lastError: () => state.lastLinkedInError
    };

    root.addEventListener('sigma:linkedin-error', (event) => {
      displayLinkedInError(event.detail?.error || event.detail);
    });

    root.addEventListener('unhandledrejection', (event) => {
      const reason = event.reason;
      const text = backendError(reason);
      if (/linkedin/i.test(text) || /linkedin/i.test(String(reason?.provider || ''))) {
        displayLinkedInError(reason);
      }
    });
  }

  function reconcile() {
    replaceAlexText();
    installProOverride();
    patchYouTubeProfessionalGate();
    showLinkedInCards();
  }

  function diagnostics() {
    return {
      ok: true,
      release: state.release,
      uid: firebaseUser()?.uid || null,
      displayName: preferredDisplayName() || null,
      adminPro: isAdminPro(),
      edition: root.SigmaAccountProviderWaveV1?.edition?.() || null,
      youtubeScopesPresent: hasGoogleScopes(REQUIRED_YOUTUBE_SCOPES),
      linkedInCardsVisible: linkedInCards().filter((card) => {
        const style = getComputedStyle(card);
        return !card.hidden && style.display !== 'none' && style.visibility !== 'hidden';
      }).length,
      lastLinkedInError: state.lastLinkedInError
    };
  }

  installGoogleScopeGuard();
  installLinkedInErrorBridge();

  root.SigmaAccountProviderWaveV1 = Object.assign(root.SigmaAccountProviderWaveV1 || {}, {
    diagnostics,
    reconcile,
    authorizeGoogleForYouTube,
    displayLinkedInError
  });

  const observer = new MutationObserver(() => reconcile());
  const start = () => {
    reconcile();
    observer.observe(document.documentElement, { childList: true, subtree: true });
    setInterval(reconcile, 2000);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }

  const auth = root.SigmaCloud?.auth;
  if (auth && typeof auth.onAuthStateChanged === 'function') {
    auth.onAuthStateChanged(() => setTimeout(reconcile, 0));
  }
})(typeof globalThis !== 'undefined' ? globalThis : window);