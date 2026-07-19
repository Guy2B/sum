'use strict';
window.SIGMA_SOCIAL_CONFIG = Object.freeze({
  version: '4.9.0',
  connectorBaseUrl: '',
  firestoreSync: true,
  providers: Object.freeze({
    meta: { enabled: true, configured: false, label: 'Facebook + Instagram' },
    linkedin: { enabled: true, configured: false, label: 'LinkedIn' },
    youtube: { enabled: true, configured: true, label: 'YouTube' },
    tiktok: { enabled: true, configured: false, label: 'TikTok' },
    x: { enabled: true, configured: false, label: 'X' }
  })
});
