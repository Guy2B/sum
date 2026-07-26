'use strict';
(function (root) {
  const ADMIN_UID = 'Rjsjx7Q3VcVyDqk86t9kEhp2GGJ2';

  function user() {
    return root.SigmaCloud?.auth?.currentUser || root.SigmaCloud?.user || null;
  }

  function displayName() {
    const current = user();
    const firebaseName = String(current?.displayName || '').trim();
    if (firebaseName && !/^alex$/i.test(firebaseName)) return firebaseName;
    const emailName = String(current?.email || '').split('@')[0].trim();
    return /^alex$/i.test(emailName) ? '' : emailName;
  }

  function isAdminPro() {
    return user()?.uid === ADMIN_UID;
  }

  function applyIdentity() {
    const name = displayName();
    if (!name) return;
    document.querySelectorAll('[data-user-name],#account-name,#profile-name,#user-display-name,.user-name,.profile-name')
      .forEach((node) => {
        const value = String(node.textContent || '').trim();
        if (!value || /^alex$/i.test(value)) node.textContent = name;
      });
  }

  function applyPro() {
    const pro = isAdminPro();
    document.documentElement.toggleAttribute('data-sigma-admin-pro', pro);
    if (pro) {
      document.documentElement.dataset.sigmaEdition = 'pro';
      root.dispatchEvent(new CustomEvent('sigma:edition-resolved', {
        detail: { edition: 'pro', plan: 'pro', uid: ADMIN_UID, source: 'admin-uid-v2' }
      }));
    }
  }

  function reconcile() {
    applyIdentity();
    applyPro();
  }

  root.SigmaWaveIdentityProV2 = {
    user,
    displayName,
    isAdminPro,
    reconcile,
    diagnostics() {
      return {
        ok: true,
        uid: user()?.uid || null,
        firebaseDisplayName: user()?.displayName || null,
        effectiveDisplayName: displayName() || null,
        adminPro: isAdminPro(),
        htmlEdition: document.documentElement.dataset.sigmaEdition || null
      };
    }
  };

  const start = () => {
    reconcile();
    new MutationObserver(reconcile).observe(document.documentElement, { childList: true, subtree: true });
    root.SigmaCloud?.auth?.onAuthStateChanged?.(() => setTimeout(reconcile, 0));
  };
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', start, { once: true }) : start();
})(globalThis);
