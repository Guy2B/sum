'use strict';
function configured(env) { return Boolean(env.LINKEDIN_CLIENT_ID && env.LINKEDIN_CLIENT_SECRET && env.LINKEDIN_REDIRECT_URI); }
function authUrl(env, state) {
  const url = new URL('https://www.linkedin.com/oauth/v2/authorization');
  url.searchParams.set('response_type', 'code'); url.searchParams.set('client_id', env.LINKEDIN_CLIENT_ID); url.searchParams.set('redirect_uri', env.LINKEDIN_REDIRECT_URI); url.searchParams.set('state', state); url.searchParams.set('scope', env.LINKEDIN_SCOPES || 'openid profile email'); return url.toString();
}
async function fetchJson(url, options = {}) { const response = await fetch(url, options); const payload = await response.json().catch(() => ({})); if (!response.ok || payload.error) throw new Error(payload.error_description || payload.message || payload.error || `LinkedIn request failed (${response.status}).`); return payload; }
async function exchange(env, code) { return fetchJson('https://www.linkedin.com/oauth/v2/accessToken', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'authorization_code', code, client_id: env.LINKEDIN_CLIENT_ID, client_secret: env.LINKEDIN_CLIENT_SECRET, redirect_uri: env.LINKEDIN_REDIRECT_URI }) }); }
async function account(env, tokens) { const profile = await fetchJson('https://api.linkedin.com/v2/userinfo', { headers: { Authorization: `Bearer ${tokens.access_token}` } }); return { provider: 'linkedin', externalId: profile.sub, label: profile.name || profile.email || 'LinkedIn account', capability: 'profile-and-approved-products', tokens }; }
async function listInteractions() { return []; }
module.exports = { configured, authUrl, exchange, account, listInteractions };
