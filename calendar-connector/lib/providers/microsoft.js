'use strict';
function tenant(env) { return env.MICROSOFT_CALENDAR_TENANT || 'common'; }
function configured(env) { return Boolean(env.MICROSOFT_CALENDAR_CLIENT_ID && env.MICROSOFT_CALENDAR_CLIENT_SECRET && env.MICROSOFT_CALENDAR_REDIRECT_URI); }
function authUrl(env, state, loginHint = '') {
  const url = new URL(`https://login.microsoftonline.com/${tenant(env)}/oauth2/v2.0/authorize`);
  url.searchParams.set('client_id', env.MICROSOFT_CALENDAR_CLIENT_ID); url.searchParams.set('response_type','code');
  url.searchParams.set('redirect_uri', env.MICROSOFT_CALENDAR_REDIRECT_URI); url.searchParams.set('response_mode','query');
  url.searchParams.set('scope','openid profile email offline_access User.Read Calendars.Read'); url.searchParams.set('state',state);
  if (loginHint) url.searchParams.set('login_hint', loginHint); return url.toString();
}
async function json(url, options = {}) { const response = await fetch(url, options); const payload = await response.json().catch(() => ({})); if (!response.ok) throw new Error(payload.error_description || payload.error?.message || `Microsoft request failed (${response.status}).`); return payload; }
async function exchange(env, code) {
  const tokens = await json(`https://login.microsoftonline.com/${tenant(env)}/oauth2/v2.0/token`, { method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body:new URLSearchParams({ client_id:env.MICROSOFT_CALENDAR_CLIENT_ID, client_secret:env.MICROSOFT_CALENDAR_CLIENT_SECRET, code, redirect_uri:env.MICROSOFT_CALENDAR_REDIRECT_URI, grant_type:'authorization_code', scope:'openid profile email offline_access User.Read Calendars.Read' }) });
  const profile = await json('https://graph.microsoft.com/v1.0/me?$select=id,displayName,mail,userPrincipalName', { headers:{Authorization:`Bearer ${tokens.access_token}`} });
  const email = profile.mail || profile.userPrincipalName; if (!email) throw new Error('Microsoft account email unavailable.');
  return { email, label: profile.displayName || email, tokens };
}
async function refresh(env, tokens) {
  if (!tokens.refresh_token) return tokens;
  const next = await json(`https://login.microsoftonline.com/${tenant(env)}/oauth2/v2.0/token`, { method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body:new URLSearchParams({ client_id:env.MICROSOFT_CALENDAR_CLIENT_ID, client_secret:env.MICROSOFT_CALENDAR_CLIENT_SECRET, refresh_token:tokens.refresh_token, grant_type:'refresh_token', scope:'openid profile email offline_access User.Read Calendars.Read' }) });
  return { ...tokens, ...next, refresh_token: next.refresh_token || tokens.refresh_token };
}
async function listEvents(env, account, updateTokens) {
  let tokens = account.auth.tokens; const now = new Date(); const end = new Date(now.getTime() + 90 * 86400000);
  const url = new URL('https://graph.microsoft.com/v1.0/me/calendarView');
  url.searchParams.set('startDateTime', new Date(now.getTime() - 7 * 86400000).toISOString()); url.searchParams.set('endDateTime', end.toISOString());
  url.searchParams.set('$top','250'); url.searchParams.set('$orderby','start/dateTime'); url.searchParams.set('$select','id,subject,start,end,isAllDay,location,bodyPreview,webLink,isCancelled,lastModifiedDateTime');
  async function request() { return fetch(url, { headers:{Authorization:`Bearer ${tokens.access_token}`, Prefer:'outlook.timezone="UTC"'} }); }
  let response = await request(); if (response.status === 401 && tokens.refresh_token) { tokens = await refresh(env,tokens); updateTokens(tokens); response = await request(); }
  const payload = await response.json().catch(() => ({})); if (!response.ok) throw new Error(payload.error?.message || 'Microsoft Calendar request failed.');
  return (payload.value || []).filter((event) => !event.isCancelled).map((event) => ({
    id:`microsoft-${event.id}`, externalId:event.id, provider:'microsoft', accountId:account.id,
    title:event.subject || 'Calendar event', date:String(event.start?.dateTime || '').slice(0,10), time:event.isAllDay ? '' : String(event.start?.dateTime || '').slice(11,16),
    startAt:event.start?.dateTime || '', endAt:event.end?.dateTime || '', allDay:Boolean(event.isAllDay),
    location:event.location?.displayName || '', description:event.bodyPreview || '', sourceUrl:event.webLink || '', status:'confirmed', updatedAt:event.lastModifiedDateTime || ''
  }));
}
module.exports = { configured, authUrl, exchange, listEvents };
