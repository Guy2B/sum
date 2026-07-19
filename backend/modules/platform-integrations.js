'use strict';
(() => {
  const cfg = window.SIGMA_PLATFORM_CONFIG || {};
  const registry = {
    meta: { label: 'Facebook / Instagram', mode: 'oauth', configured: () => Boolean(cfg.metaAppId), note: 'Nécessite une app Meta validée et les permissions Graph API.' },
    linkedin: { label: 'LinkedIn', mode: 'oauth', configured: () => Boolean(cfg.linkedinClientId), note: 'Publication soumise aux produits et permissions approuvés par LinkedIn.' },
    x: { label: 'X', mode: 'backend', configured: () => Boolean(cfg.xApiBaseUrl), note: 'Écriture via backend requis; les offres et quotas X peuvent être payants.' },
    tiktok: { label: 'TikTok', mode: 'oauth', configured: () => Boolean(cfg.tiktokClientKey), note: 'Content Posting API soumise à validation TikTok.' },
    microsoft: { label: 'Outlook / Microsoft 365', mode: 'oauth', configured: () => Boolean(cfg.microsoftClientId), note: 'Microsoft Graph avec application Entra ID.' },
    appleHealth: { label: 'Apple Health / Apple Watch', mode: 'native', configured: () => false, note: 'Nécessite l’application iOS native et HealthKit.' },
    healthConnect: { label: 'Health Connect / Wear OS', mode: 'native', configured: () => false, note: 'Nécessite l’application Android native et les autorisations Health Connect.' }
  };
  const status = () => Object.fromEntries(Object.entries(registry).map(([key, item]) => [key, { label: item.label, mode: item.mode, configured: item.configured(), note: item.note }]));
  window.SigmaPlatforms = { registry, status, config: cfg };
})();
