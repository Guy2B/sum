'use strict';
const { google } = require('googleapis');
function configured(env) { return Boolean(env.GOOGLE_CALENDAR_CLIENT_ID && env.GOOGLE_CALENDAR_CLIENT_SECRET && env.GOOGLE_CALENDAR_REDIRECT_URI); }
function client(env) { return new google.auth.OAuth2(env.GOOGLE_CALENDAR_CLIENT_ID, env.GOOGLE_CALENDAR_CLIENT_SECRET, env.GOOGLE_CALENDAR_REDIRECT_URI); }
function authUrl(env, state, loginHint = '') {
  const oauth = client(env);
  return oauth.generateAuthUrl({ access_type: 'offline', prompt: 'consent', include_granted_scopes: true, state, login_hint: loginHint || undefined, scope: ['openid','email','profile','https://www.googleapis.com/auth/calendar.readonly'] });
}
async function exchange(env, code) {
  const oauth = client(env); const { tokens } = await oauth.getToken(code); oauth.setCredentials(tokens);
  const profile = await google.oauth2({ version: 'v2', auth: oauth }).userinfo.get();
  if (!profile.data.email) throw new Error('Google account email unavailable.');
  return { email: profile.data.email, label: profile.data.name || profile.data.email, tokens };
}
async function listEvents(env, account, updateTokens) {
  const oauth = client(env); oauth.setCredentials(account.auth.tokens);
  oauth.on('tokens', (tokens) => updateTokens({ ...account.auth.tokens, ...tokens }));
  const api = google.calendar({ version: 'v3', auth: oauth });
  const now = new Date(); const end = new Date(now.getTime() + 90 * 86400000);
  const response = await api.events.list({ calendarId: 'primary', timeMin: new Date(now.getTime() - 7 * 86400000).toISOString(), timeMax: end.toISOString(), singleEvents: true, orderBy: 'startTime', maxResults: 250 });
  return (response.data.items || []).filter((event) => event.status !== 'cancelled').map((event) => ({
    id: `google-${event.id}`, externalId: event.id, provider: 'google', accountId: account.id,
    title: event.summary || 'Calendar event', date: String(event.start?.date || event.start?.dateTime || '').slice(0,10),
    time: event.start?.dateTime ? new Date(event.start.dateTime).toTimeString().slice(0,5) : '',
    startAt: event.start?.dateTime || event.start?.date || '', endAt: event.end?.dateTime || event.end?.date || '',
    allDay: Boolean(event.start?.date), location: event.location || '', description: event.description || '',
    sourceUrl: event.htmlLink || '', status: event.status || 'confirmed', updatedAt: event.updated || ''
  }));
}
module.exports = { configured, authUrl, exchange, listEvents };
