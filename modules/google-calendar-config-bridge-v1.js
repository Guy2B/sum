(function (root) {
  'use strict';
  const scopes = [
    'openid','email','profile',
    'https://www.googleapis.com/auth/calendar.readonly'
  ];
  function read() {
    const source = root.SIGMA_GOOGLE_CLOUD_CONFIG || {};
    return {
      clientId: String(source.oauthClientId || '').trim(),
      apiKey: String(source.apiKey || '').trim(),
      discoveryDoc: String(source.discoveryDoc || 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'),
      scopes: scopes.join(' ')
    };
  }
  function ready() {
    const c = read();
    return Boolean(c.clientId && !c.clientId.startsWith('REPLACE_') && c.clientId.endsWith('.apps.googleusercontent.com'));
  }
  const api = { read, get: read, ready };
  if (!root.SigmaGoogleCalendarConfigV1) root.SigmaGoogleCalendarConfigV1 = api;
  if (!root.SigmaGoogleConfig) root.SigmaGoogleConfig = api;
})(window);