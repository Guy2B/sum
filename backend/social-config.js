'use strict';
window.SIGMA_SOCIAL_CONFIG = Object.freeze({
  version: '4.9.1',
  connectorBaseUrl: '',
  firestoreSync: true,
  firebaseFunctionsRegion: 'europe-west1',
  providers: Object.freeze({
    meta: Object.freeze({
      enabled: true,
      configured: false,
      appId: 'REPLACE_WITH_META_APP_ID',
      label: 'Facebook Pages + Instagram Business',
      capabilities: Object.freeze(['accounts', 'posts', 'comments', 'metrics']),
      note: 'Requires a Meta developer app and deployed Firebase Cloud Functions.'
    }),
    linkedin: { enabled: true, configured: false, label: 'LinkedIn' },
    youtube: { enabled: true, configured: true, label: 'YouTube' },
    tiktok: { enabled: true, configured: false, label: 'TikTok' },
    x: { enabled: true, configured: false, label: 'X' }
  })
});
