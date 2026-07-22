'use strict';
window.SIGMA_SOCIAL_CONFIG = Object.freeze({
  version: '4.9.4',
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
    linkedin: Object.freeze({ enabled: true, configured: true, clientId: '78d1pbb1n11aqo', label: 'LinkedIn', capabilities: Object.freeze(['profile', 'posts']), note: 'Requires LinkedIn OAuth Cloud Functions and approved products/scopes.' }),
    youtube: Object.freeze({ enabled: true, configured: true, label: 'YouTube', capabilities: Object.freeze(['subscriptions', 'channel']), note: 'Uses the existing Google OAuth connection.' }),
    tiktok: Object.freeze({ enabled: true, configured: true, clientKey: 'sbawtupvcsxbznlrj2', label: 'TikTok', capabilities: Object.freeze(['profile', 'videos']), note: 'Requires TikTok Login Kit and Cloud Functions.' }),
    x: Object.freeze({ enabled: true, configured: true, clientId: 'eE1uTXR6MjQybmd6c0o2ejkwMXE6MTpjaQ', label: 'X', capabilities: Object.freeze(['profile', 'posts']), note: 'Requires X OAuth 2.0 PKCE and an API access tier.' })
  })
});
