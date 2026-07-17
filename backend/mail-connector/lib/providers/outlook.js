'use strict';
function configured(env) { return Boolean(env.MICROSOFT_CLIENT_ID && env.MICROSOFT_CLIENT_SECRET && env.MICROSOFT_REDIRECT_URI); }
function tenant(env) { return env.MICROSOFT_TENANT || 'common'; }
function scopes() { return 'openid profile offline_access User.Read Mail.Read'; }
function authUrl(env, state) {
  const params = new URLSearchParams({ client_id: env.MICROSOFT_CLIENT_ID, response_type: 'code', redirect_uri: env.MICROSOFT_REDIRECT_URI, response_mode: 'query', scope: scopes(), state });
  return `https://login.microsoftonline.com/${tenant(env)}/oauth2/v2.0/authorize?${params}`;
}
async function tokenRequest(env, params) {
  const response = await fetch(`https://login.microsoftonline.com/${tenant(env)}/oauth2/v2.0/token`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ client_id: env.MICROSOFT_CLIENT_ID, client_secret: env.MICROSOFT_CLIENT_SECRET, redirect_uri: env.MICROSOFT_REDIRECT_URI, ...params }) });
  const data = await response.json(); if (!response.ok) throw new Error(data.error_description || data.error || 'Microsoft token exchange failed.'); return data;
}
async function exchange(env, code) {
  const tokens = await tokenRequest(env, { grant_type: 'authorization_code', code, scope: scopes() });
  const profileResponse = await fetch('https://graph.microsoft.com/v1.0/me?$select=mail,userPrincipalName,displayName', { headers: { Authorization: `Bearer ${tokens.access_token}` } });
  const profile = await profileResponse.json(); if (!profileResponse.ok) throw new Error(profile.error?.message || 'Microsoft profile failed.');
  return { email: profile.mail || profile.userPrincipalName, tokens: { ...tokens, expires_at: Date.now() + Number(tokens.expires_in || 3600) * 1000 } };
}
async function validTokens(env, account, saveTokens) {
  let tokens = account.auth.tokens;
  if (!tokens.expires_at || tokens.expires_at - Date.now() > 60000) return tokens;
  if (!tokens.refresh_token) throw new Error('Microsoft refresh token is missing. Reconnect the account.');
  const refreshed = await tokenRequest(env, { grant_type: 'refresh_token', refresh_token: tokens.refresh_token, scope: scopes() });
  tokens = { ...tokens, ...refreshed, refresh_token: refreshed.refresh_token || tokens.refresh_token, expires_at: Date.now() + Number(refreshed.expires_in || 3600) * 1000 };
  saveTokens(tokens); return tokens;
}
async function listMessages(env, account, saveTokens) {
  const tokens = await validTokens(env, account, saveTokens);
  const query = new URLSearchParams({ '$top': '50', '$select': 'id,subject,from,receivedDateTime,isRead,importance,bodyPreview,webLink', '$orderby': 'receivedDateTime desc' });
  const response = await fetch(`https://graph.microsoft.com/v1.0/me/messages?${query}`, { headers: { Authorization: `Bearer ${tokens.access_token}` } });
  const data = await response.json(); if (!response.ok) throw new Error(data.error?.message || 'Outlook message retrieval failed.');
  return (data.value || []).map((m) => ({ id: `outlook:${m.id}`, remoteId: m.id, accountId: account.id, provider: 'outlook', subject: m.subject || '', sender: m.from?.emailAddress?.address || m.from?.emailAddress?.name || '', snippet: m.bodyPreview || '', receivedAt: m.receivedDateTime || new Date().toISOString(), unread: !m.isRead, importance: m.importance === 'high' ? 'high' : 'normal', needsReply: false, sourceUrl: m.webLink || '' }));
}
module.exports = { configured, authUrl, exchange, listMessages };
