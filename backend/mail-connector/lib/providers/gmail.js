'use strict';
const { google } = require('googleapis');
function configured(env) { return Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_REDIRECT_URI); }
function client(env) { return new google.auth.OAuth2(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, env.GOOGLE_REDIRECT_URI); }
function authUrl(env, state, loginHint = '') {
  const oauth = client(env);
  return oauth.generateAuthUrl({ access_type: 'offline', prompt: 'consent', state, login_hint: loginHint || undefined, scope: ['openid','email','profile','https://www.googleapis.com/auth/gmail.readonly'] });
}
async function exchange(env, code) {
  const oauth = client(env); const { tokens } = await oauth.getToken(code); oauth.setCredentials(tokens);
  const gmail = google.gmail({ version: 'v1', auth: oauth }); const profile = await gmail.users.getProfile({ userId: 'me' });
  return { email: profile.data.emailAddress, tokens };
}
async function listMessages(env, account, saveTokens) {
  const oauth = client(env); oauth.setCredentials(account.auth.tokens);
  oauth.on('tokens', (tokens) => saveTokens({ ...account.auth.tokens, ...tokens }));
  const gmail = google.gmail({ version: 'v1', auth: oauth });
  const listed = await gmail.users.messages.list({ userId: 'me', maxResults: 50, q: 'newer_than:45d -in:spam -in:trash' });
  const ids = listed.data.messages || [];
  const messages = await Promise.all(ids.map(async ({ id }) => {
    const result = await gmail.users.messages.get({ userId: 'me', id, format: 'metadata', metadataHeaders: ['Subject','From','Date'] });
    const headers = Object.fromEntries((result.data.payload?.headers || []).map((h) => [String(h.name).toLowerCase(), h.value]));
    const labels = result.data.labelIds || [];
    return { id: `gmail:${id}`, remoteId: id, accountId: account.id, provider: 'gmail', subject: headers.subject || '', sender: headers.from || '', snippet: result.data.snippet || '', receivedAt: headers.date ? new Date(headers.date).toISOString() : new Date().toISOString(), unread: labels.includes('UNREAD'), importance: labels.includes('IMPORTANT') ? 'high' : 'normal', needsReply: false, sourceUrl: `https://mail.google.com/mail/u/0/#inbox/${id}` };
  }));
  return messages;
}
module.exports = { configured, authUrl, exchange, listMessages };
