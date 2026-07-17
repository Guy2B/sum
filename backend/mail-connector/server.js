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
const gmail = require('./lib/providers/gmail');
const outlook = require('./lib/providers/outlook');
const imap = require('./lib/providers/imap');

const env = process.env;
const PORT = Number(env.PORT || 8787);
const SESSION_SECRET = env.SESSION_SECRET;
const ENCRYPTION_KEY = env.TOKEN_ENCRYPTION_KEY;
if (!SESSION_SECRET || SESSION_SECRET.length < 24) throw new Error('SESSION_SECRET must contain at least 24 characters.');
const appOrigins = String(env.APP_ORIGINS || 'http://localhost:8080').split(',').map((x) => x.trim()).filter(Boolean);
const returnUrl = env.APP_RETURN_URL || `${appOrigins[0]}/app.html#mail`;
const store = createStore(path.join(__dirname, '.data', 'mail-store.enc.json'), ENCRYPTION_KEY);
const app = express();
app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin(origin, callback) { if (!origin || appOrigins.includes(origin)) return callback(null, true); callback(new Error('Origin not allowed.')); }, credentials: true }));
app.use(express.json({ limit: '64kb' }));
app.use(cookieParser(SESSION_SECRET));
app.use(rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: true, legacyHeaders: false }));

function sessionMiddleware(req, res, next) {
  let id = req.signedCookies.sum_mail_session;
  if (!id) {
    id = crypto.randomUUID();
    const sameSite = env.COOKIE_SAME_SITE || 'lax';
    res.cookie('sum_mail_session', id, { signed: true, httpOnly: true, secure: env.NODE_ENV === 'production' || sameSite === 'none', sameSite, maxAge: 180 * 24 * 3600 * 1000, path: '/' });
  }
  req.sumSession = id; next();
}
app.use(sessionMiddleware);
function session(req) { return store.getSession(req.sumSession); }
function sanitized(account) { return { id: account.id, provider: account.provider, email: account.email, status: account.status || 'connected', createdAt: account.createdAt }; }
function upsertAccount(sessionId, account) { store.updateSession(sessionId, (draft) => { draft.accounts = (draft.accounts || []).filter((item) => !(item.provider === account.provider && item.email.toLowerCase() === account.email.toLowerCase())); draft.accounts.push(account); }); }
function updateTokens(sessionId, accountId, tokens) { store.updateSession(sessionId, (draft) => { const account = (draft.accounts || []).find((item) => item.id === accountId); if (account) account.auth.tokens = tokens; }); }
function redirectResult(ok, provider, message = '') { const url = new URL(returnUrl); url.searchParams.set('mail', ok ? 'connected' : 'error'); url.searchParams.set('provider', provider); if (message) url.searchParams.set('message', message.slice(0, 180)); return url.toString(); }

app.get('/health', (req,res) => res.json({ ok:true, version:'1.5.0', providers:{ gmail:gmail.configured(env), outlook:outlook.configured(env), yahoo:true, gmx:true } }));
app.get('/api/mail/providers', (req,res) => res.json({ providers:{ gmail:{ configured:gmail.configured(env), auth:'oauth' }, outlook:{ configured:outlook.configured(env), auth:'oauth' }, yahoo:{ configured:true, auth:'app-password' }, gmx:{ configured:true, auth:'app-password' } } }));
app.get('/api/mail/accounts', (req,res) => res.json({ accounts:(session(req).accounts || []).map(sanitized) }));

app.get('/api/mail/connect/:provider', (req,res,next) => {
  try {
    const provider = req.params.provider;
    if (!['gmail','outlook'].includes(provider)) return res.status(400).json({ error:'Use the IMAP connection endpoint.' });
    const adapter = provider === 'gmail' ? gmail : outlook;
    if (!adapter.configured(env)) return res.status(503).json({ error:`${provider} OAuth is not configured.` });
    const state = signState({ sid:req.sumSession, provider }, SESSION_SECRET);
    res.redirect(adapter.authUrl(env,state));
  } catch(error){next(error)}
});
app.get('/api/mail/callback/:provider', async (req,res) => {
  const provider=req.params.provider;
  try {
    const payload=verifyState(req.query.state,SESSION_SECRET); if(payload.sid!==req.sumSession||payload.provider!==provider) throw new Error('OAuth session mismatch.');
    const adapter=provider==='gmail'?gmail:outlook; const result=await adapter.exchange(env,String(req.query.code||''));
    upsertAccount(req.sumSession,{id:crypto.randomUUID(),provider,email:result.email,status:'connected',createdAt:new Date().toISOString(),auth:{type:'oauth',tokens:result.tokens}});
    res.redirect(redirectResult(true,provider));
  } catch(error){res.redirect(redirectResult(false,provider,error.message))}
});
app.post('/api/mail/connect/imap', async (req,res,next) => {
  try {
    const provider=String(req.body.provider||'');const email=String(req.body.email||'').trim().toLowerCase();const appPassword=String(req.body.appPassword||'');
    if(!['yahoo','gmx'].includes(provider)||!email||appPassword.length<8)return res.status(400).json({error:'Invalid IMAP connection data.'});
    await imap.validate(provider,email,appPassword);
    upsertAccount(req.sumSession,{id:crypto.randomUUID(),provider,email,status:'connected',createdAt:new Date().toISOString(),auth:{type:'imap',appPassword}});
    res.json({ok:true});
  }catch(error){next(error)}
});
app.delete('/api/mail/accounts/:id',(req,res)=>{store.updateSession(req.sumSession,(draft)=>{draft.accounts=(draft.accounts||[]).filter((a)=>a.id!==req.params.id)});res.json({ok:true})});
app.get('/api/mail/messages', async (req,res) => {
  const accounts=session(req).accounts||[];const messages=[];const errors=[];
  for(const account of accounts){try{let rows=[];if(account.provider==='gmail')rows=await gmail.listMessages(env,account,(tokens)=>updateTokens(req.sumSession,account.id,tokens));else if(account.provider==='outlook')rows=await outlook.listMessages(env,account,(tokens)=>updateTokens(req.sumSession,account.id,tokens));else rows=await imap.listMessages(account);messages.push(...rows)}catch(error){errors.push({accountId:account.id,provider:account.provider,message:error.message})}}
  messages.sort((a,b)=>String(b.receivedAt).localeCompare(String(a.receivedAt)));res.json({messages:messages.slice(0,Number(req.query.limit||100)),errors});
});

app.use((error,req,res,next)=>{console.error(error.message);res.status(500).json({error:'Mail connector error.',detail:env.NODE_ENV==='development'?error.message:undefined})});
app.listen(PORT,()=>console.log(`SUM Mail Connector listening on http://localhost:${PORT}`));
