'use strict';
require('dotenv').config();
const path = require('node:path');
const crypto = require('node:crypto');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { rateLimit } = require('express-rate-limit');
const { createStore } = require('./lib/store');
const { signState, verifyState } = require('./lib/state');
const meta = require('./lib/providers/meta');
const youtube = require('./lib/providers/youtube');
const xProvider = require('./lib/providers/x');
const linkedin = require('./lib/providers/linkedin');
const tiktok = require('./lib/providers/tiktok');

const env = process.env;
const PORT = Number(env.PORT || 8888);
const SESSION_SECRET = env.SESSION_SECRET;
if (!SESSION_SECRET || SESSION_SECRET.length < 24) throw new Error('SESSION_SECRET must contain at least 24 characters.');
const appOrigins = String(env.APP_ORIGINS || 'http://localhost:8080').split(',').map((value) => value.trim()).filter(Boolean);
const returnUrl = env.APP_RETURN_URL || `${appOrigins[0]}/app.html#social`;
const store = createStore(path.join(__dirname, '.data', 'social-store.enc.json'), env.TOKEN_ENCRYPTION_KEY);
const app = express();
app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin(origin, callback) { if (!origin || appOrigins.includes(origin)) return callback(null, true); callback(new Error('Origin not allowed.')); }, credentials: true }));
app.use(express.json({ limit: '64kb' }));
app.use(cookieParser(SESSION_SECRET));
app.use(rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: true, legacyHeaders: false }));

app.use((req, res, next) => {
  let id = req.signedCookies.sigma_social_session;
  if (!id) {
    id = crypto.randomUUID();
    const sameSite = env.COOKIE_SAME_SITE || 'lax';
    res.cookie('sigma_social_session', id, { signed: true, httpOnly: true, secure: env.NODE_ENV === 'production' || sameSite === 'none', sameSite, maxAge: 180 * 24 * 3600 * 1000, path: '/' });
  }
  req.sigmaSession = id;
  next();
});

function session(req) { return store.getSession(req.sigmaSession); }
function sanitise(account) { return { id: account.id, provider: account.provider, label: account.label, status: account.status || 'connected', createdAt: account.createdAt }; }
function upsertAccounts(sessionId, rows) {
  store.updateSession(sessionId, (draft) => {
    draft.accounts = draft.accounts || [];
    for (const row of rows) {
      draft.accounts = draft.accounts.filter((item) => !(item.provider === row.provider && item.externalId === row.externalId));
      draft.accounts.push(row);
    }
  });
}
function updateTokens(sessionId, accountId, tokens) {
  store.updateSession(sessionId, (draft) => { const account = (draft.accounts || []).find((item) => item.id === accountId); if (account) account.auth.tokens = tokens; });
}
function redirectResult(ok, provider, message = '') {
  const url = new URL(returnUrl);
  url.searchParams.set('social', ok ? 'connected' : 'error');
  url.searchParams.set('provider', provider);
  if (message) url.searchParams.set('message', message.slice(0, 180));
  return url.toString();
}

app.get('/health', (req, res) => res.json({ ok: true, version: '1.7.0', providers: { instagram: meta.configured(env), facebook: meta.configured(env), youtube: youtube.configured(env), x: xProvider.configured(env), linkedin: linkedin.configured(env), tiktok: tiktok.configured(env) } }));
app.get('/api/social/providers', (req, res) => res.json({ providers: { instagram: { configured: meta.configured(env), capability: 'professional-messages-comments' }, facebook: { configured: meta.configured(env), capability: 'page-messages-comments' }, youtube: { configured: youtube.configured(env), capability: 'channel-comments' }, x: { configured: xProvider.configured(env), capability: 'mentions-and-dm-when-plan-allows' }, linkedin: { configured: linkedin.configured(env), capability: 'profile-and-approved-products' }, tiktok: { configured: tiktok.configured(env), capability: 'profile-videos-and-content-posting' } } }));
app.get('/api/social/accounts', (req, res) => res.json({ accounts: (session(req).accounts || []).map(sanitise) }));

app.get('/api/social/connect/:provider', (req, res) => {
  const provider = req.params.provider;
  try {
    if (['instagram', 'facebook'].includes(provider)) {
      if (!meta.configured(env)) return res.status(503).json({ error: 'Meta OAuth is not configured.' });
      const state = signState({ sid: req.sigmaSession, provider, adapter: 'meta' }, SESSION_SECRET);
      return res.redirect(meta.authUrl(env, state, provider));
    }
    if (provider === 'youtube') {
      if (!youtube.configured(env)) return res.status(503).json({ error: 'YouTube OAuth is not configured.' });
      const state = signState({ sid: req.sigmaSession, provider, adapter: 'youtube' }, SESSION_SECRET);
      return res.redirect(youtube.authUrl(env, state));
    }
    if (provider === 'x') {
      if (!xProvider.configured(env)) return res.status(503).json({ error: 'X OAuth is not configured.' });
      const codeVerifier = xProvider.verifier();
      const state = signState({ sid: req.sigmaSession, provider, adapter: 'x', codeVerifier }, SESSION_SECRET);
      return res.redirect(xProvider.authUrl(env, state, codeVerifier));
    }
    if (provider === 'linkedin') {
      if (!linkedin.configured(env)) return res.status(503).json({ error: 'LinkedIn OAuth is not configured.' });
      const state = signState({ sid: req.sigmaSession, provider, adapter: 'linkedin' }, SESSION_SECRET);
      return res.redirect(linkedin.authUrl(env, state));
    }
    if (provider === 'tiktok') {
      if (!tiktok.configured(env)) return res.status(503).json({ error: 'TikTok OAuth is not configured.' });
      const state = signState({ sid: req.sigmaSession, provider, adapter: 'tiktok' }, SESSION_SECRET);
      return res.redirect(tiktok.authUrl(env, state));
    }
    return res.status(400).json({ error: 'Unknown social provider.' });
  } catch (error) { return res.status(500).json({ error: error.message }); }
});

app.get('/api/social/callback/meta', async (req, res) => {
  try {
    const payload = verifyState(req.query.state, SESSION_SECRET);
    if (payload.sid !== req.sigmaSession || payload.adapter !== 'meta') throw new Error('OAuth session mismatch.');
    const token = await meta.exchange(env, String(req.query.code || ''));
    const rows = await meta.accounts(env, token.access_token, payload.provider);
    upsertAccounts(req.sigmaSession, rows.map((row) => ({ id: crypto.randomUUID(), ...row, status: 'connected', createdAt: new Date().toISOString(), auth: { type: 'oauth', accessToken: row.accessToken, userToken: token.access_token } })));
    res.redirect(redirectResult(true, payload.provider));
  } catch (error) { res.redirect(redirectResult(false, 'meta', error.message)); }
});

app.get('/api/social/callback/youtube', async (req, res) => {
  try {
    const payload = verifyState(req.query.state, SESSION_SECRET);
    if (payload.sid !== req.sigmaSession || payload.adapter !== 'youtube') throw new Error('OAuth session mismatch.');
    const tokens = await youtube.exchange(env, String(req.query.code || ''));
    const row = await youtube.account(env, tokens);
    upsertAccounts(req.sigmaSession, [{ id: crypto.randomUUID(), ...row, status: 'connected', createdAt: new Date().toISOString(), auth: { type: 'oauth', tokens } }]);
    res.redirect(redirectResult(true, 'youtube'));
  } catch (error) { res.redirect(redirectResult(false, 'youtube', error.message)); }
});

async function completeOAuth(req, res, adapterName, adapter) {
  try {
    const payload = verifyState(req.query.state, SESSION_SECRET);
    if (payload.sid !== req.sigmaSession || payload.adapter !== adapterName) throw new Error('OAuth session mismatch.');
    const tokens = adapterName === 'x' ? await adapter.exchange(env, String(req.query.code || ''), payload.codeVerifier) : await adapter.exchange(env, String(req.query.code || ''));
    const row = await adapter.account(env, tokens);
    upsertAccounts(req.sigmaSession, [{ id: crypto.randomUUID(), ...row, status: 'connected', createdAt: new Date().toISOString(), auth: { type: 'oauth', tokens } }]);
    res.redirect(redirectResult(true, adapterName));
  } catch (error) { res.redirect(redirectResult(false, adapterName, error.message)); }
}
app.get('/api/social/callback/x', (req, res) => completeOAuth(req, res, 'x', xProvider));
app.get('/api/social/callback/linkedin', (req, res) => completeOAuth(req, res, 'linkedin', linkedin));
app.get('/api/social/callback/tiktok', (req, res) => completeOAuth(req, res, 'tiktok', tiktok));

app.delete('/api/social/accounts/:id', (req, res) => {
  store.updateSession(req.sigmaSession, (draft) => { draft.accounts = (draft.accounts || []).filter((account) => account.id !== req.params.id); });
  res.json({ ok: true });
});

app.get('/api/social/interactions', async (req, res) => {
  const accounts = session(req).accounts || [];
  const interactions = [];
  const errors = [];
  for (const account of accounts) {
    try {
      if (['instagram', 'facebook'].includes(account.provider)) interactions.push(...await meta.listInteractions(env, account));
      else if (account.provider === 'youtube') interactions.push(...await youtube.listInteractions(env, account, (tokens) => updateTokens(req.sigmaSession, account.id, tokens)));
      else if (account.provider === 'x') interactions.push(...await xProvider.listInteractions(env, account, (tokens) => updateTokens(req.sigmaSession, account.id, tokens)));
      else if (account.provider === 'linkedin') interactions.push(...await linkedin.listInteractions(env, account, (tokens) => updateTokens(req.sigmaSession, account.id, tokens)));
      else if (account.provider === 'tiktok') interactions.push(...await tiktok.listInteractions(env, account, (tokens) => updateTokens(req.sigmaSession, account.id, tokens)));
    } catch (error) { errors.push({ accountId: account.id, provider: account.provider, message: error.message }); }
  }
  interactions.sort((a, b) => String(b.receivedAt).localeCompare(String(a.receivedAt)));
  res.json({ interactions: interactions.slice(0, Math.min(250, Number(req.query.limit || 120))), errors });
});

app.use((error, req, res, next) => {
  console.error(error.message);
  res.status(500).json({ error: 'Social connector error.', detail: env.NODE_ENV === 'development' ? error.message : undefined });
});

app.listen(PORT, () => console.log(`Sigma Social Connector listening on http://localhost:${PORT}`));
