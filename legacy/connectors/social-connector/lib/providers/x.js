'use strict';
const crypto = require('node:crypto');

function configured(env) { return Boolean(env.X_CLIENT_ID && env.X_REDIRECT_URI); }
function verifier() { return crypto.randomBytes(48).toString('base64url'); }
function challenge(value) { return crypto.createHash('sha256').update(value).digest('base64url'); }
function authUrl(env, state, codeVerifier) {
  const url = new URL('https://x.com/i/oauth2/authorize');
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', env.X_CLIENT_ID);
  url.searchParams.set('redirect_uri', env.X_REDIRECT_URI);
  url.searchParams.set('scope', env.X_SCOPES || 'tweet.read users.read offline.access dm.read');
  url.searchParams.set('state', state);
  url.searchParams.set('code_challenge', challenge(codeVerifier));
  url.searchParams.set('code_challenge_method', 'S256');
  return url.toString();
}
async function fetchJson(url, options = {}) {
  const response = await fetch(url, options); const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.error) throw new Error(payload.error_description || payload.detail || payload.title || payload.error || `X request failed (${response.status}).`);
  return payload;
}
function tokenHeaders(env) {
  if (!env.X_CLIENT_SECRET) return { 'Content-Type': 'application/x-www-form-urlencoded' };
  return { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: `Basic ${Buffer.from(`${env.X_CLIENT_ID}:${env.X_CLIENT_SECRET}`).toString('base64')}` };
}
async function exchange(env, code, codeVerifier) {
  return fetchJson('https://api.x.com/2/oauth2/token', { method: 'POST', headers: tokenHeaders(env), body: new URLSearchParams({ code, grant_type: 'authorization_code', client_id: env.X_CLIENT_ID, redirect_uri: env.X_REDIRECT_URI, code_verifier: codeVerifier }) });
}
async function refresh(env, tokens) {
  if (!tokens.refresh_token) return tokens;
  const next = await fetchJson('https://api.x.com/2/oauth2/token', { method: 'POST', headers: tokenHeaders(env), body: new URLSearchParams({ refresh_token: tokens.refresh_token, grant_type: 'refresh_token', client_id: env.X_CLIENT_ID }) });
  return { ...tokens, ...next, refresh_token: next.refresh_token || tokens.refresh_token };
}
async function authorised(env, account, updateTokens, url) {
  let tokens = account.auth.tokens; let response = await fetch(url, { headers: { Authorization: `Bearer ${tokens.access_token}` } });
  if (response.status === 401 && tokens.refresh_token) { tokens = await refresh(env, tokens); updateTokens(tokens); response = await fetch(url, { headers: { Authorization: `Bearer ${tokens.access_token}` } }); }
  const payload = await response.json().catch(() => ({})); if (!response.ok) throw new Error(payload.detail || payload.title || 'X API request failed.'); return payload;
}
async function account(env, tokens) {
  const payload = await fetchJson('https://api.x.com/2/users/me?user.fields=id,name,username,profile_image_url', { headers: { Authorization: `Bearer ${tokens.access_token}` } });
  if (!payload.data?.id) throw new Error('No X account was returned.');
  return { provider: 'x', externalId: payload.data.id, userId: payload.data.id, label: payload.data.username ? `@${payload.data.username}` : payload.data.name || 'X account', tokens };
}
async function listInteractions(env, account, updateTokens) {
  const url = new URL(`https://api.x.com/2/users/${account.userId}/mentions`);
  url.searchParams.set('max_results', '50'); url.searchParams.set('tweet.fields', 'id,text,created_at,author_id,conversation_id,public_metrics'); url.searchParams.set('expansions', 'author_id'); url.searchParams.set('user.fields', 'id,name,username');
  const payload = await authorised(env, account, updateTokens, url);
  const users = new Map((payload.includes?.users || []).map((user) => [user.id, user]));
  return (payload.data || []).map((tweet) => { const author = users.get(tweet.author_id); const text = tweet.text || ''; return { id: `x-mention-${tweet.id}`, accountId: account.id, provider: 'x', type: 'mention', title: 'Mention on X', content: text, sender: author?.username ? `@${author.username}` : author?.name || 'X user', receivedAt: tweet.created_at || new Date().toISOString(), unread: true, requiresReply: /\?|please|could|can you|price|quote|devis|tarif/i.test(text), priority: 48 + Math.min(22, Number(tweet.public_metrics?.like_count || 0) + Number(tweet.public_metrics?.reply_count || 0) * 2), contentIdea: /how|why|guide|tutorial|comment|pourquoi|como/i.test(text), sourceUrl: `https://x.com/i/web/status/${tweet.id}` }; });
}
module.exports = { configured, verifier, authUrl, exchange, account, listInteractions };
