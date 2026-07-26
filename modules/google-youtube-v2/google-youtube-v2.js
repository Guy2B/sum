'use strict';
(function (root) {
  const KEY = 'sigma:google:granted-scopes:v2';
  const YOUTUBE_SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];

  function parse(value) {
    if (Array.isArray(value)) return value.flatMap(parse);
    return String(value || '').split(/[\s,]+/).map(v => v.trim()).filter(Boolean);
  }

  function granted() {
    try { return parse(JSON.parse(localStorage.getItem(KEY) || '[]')); }
    catch (_) { localStorage.removeItem(KEY); return []; }
  }

  function remember(scopes) {
    const merged = [...new Set([...granted(), ...parse(scopes)])];
    localStorage.setItem(KEY, JSON.stringify(merged));
    return merged;
  }

  function has(scopes) {
    const set = new Set(granted());
    return parse(scopes).every(scope => set.has(scope));
  }

  function authorizeYouTube() {
    if (has(YOUTUBE_SCOPES)) {
      root.dispatchEvent(new CustomEvent('sigma:youtube-google-ready', {
        detail: { reused: true, scopes: YOUTUBE_SCOPES }
      }));
      return { reused: true };
    }

    const nativeButton = document.querySelector(
      '[data-google-authorize],[data-mail-provider="google"],#google-authorize,#google-connect'
    );
    root.dispatchEvent(new CustomEvent('sigma:google-authorization-requested', {
      detail: { provider: 'youtube', scopes: YOUTUBE_SCOPES }
    }));
    nativeButton?.click();
    return { reused: false, nativeButtonFound: Boolean(nativeButton) };
  }

  function patchGate() {
    document.querySelectorAll('button,a,[role="button"]').forEach((node) => {
      if (!/professionnel requis|professional required/i.test(String(node.textContent || ''))) return;
      node.textContent = 'Autoriser avec Google';
      node.removeAttribute('disabled');
      node.dataset.youtubeGoogleAuthorize = 'true';
    });

    document.querySelectorAll('[data-youtube-google-authorize]').forEach((node) => {
      if (node.dataset.waveBound) return;
      node.dataset.waveBound = '1';
      node.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        authorizeYouTube();
      }, true);
    });
  }

  root.addEventListener('sigma:google-scopes-granted', event => remember(event.detail?.scopes || event.detail?.scope));
  root.addEventListener('message', event => {
    if (event.data?.type === 'sigma:google-scopes-granted') remember(event.data.scopes || event.data.scope);
  });

  root.SigmaWaveGoogleYouTubeV2 = {
    requiredScopes: [...YOUTUBE_SCOPES],
    granted,
    remember,
    has,
    authorizeYouTube,
    diagnostics() {
      return {
        ok: true,
        requiredScopes: [...YOUTUBE_SCOPES],
        grantedScopes: granted(),
        youtubeScopesPresent: has(YOUTUBE_SCOPES)
      };
    }
  };

  const start = () => {
    patchGate();
    new MutationObserver(patchGate).observe(document.documentElement, { childList: true, subtree: true });
  };
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', start, { once: true }) : start();
})(globalThis);
