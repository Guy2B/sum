'use strict';

function configured(env) {
  return Boolean(env.YOUTUBE_CLIENT_ID && env.YOUTUBE_CLIENT_SECRET && env.YOUTUBE_REDIRECT_URI);
}

function authUrl(env, state) {
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.set('client_id', env.YOUTUBE_CLIENT_ID);
  url.searchParams.set('redirect_uri', env.YOUTUBE_REDIRECT_URI);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'openid email profile https://www.googleapis.com/auth/youtube.readonly');
  url.searchParams.set('access_type', 'offline');
  url.searchParams.set('include_granted_scopes', 'true');
  url.searchParams.set('prompt', 'consent');
  url.searchParams.set('state', state);
  return url.toString();
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.error) throw new Error(payload.error_description || payload.error?.message || `YouTube request failed (${response.status}).`);
  return payload;
}

async function exchange(env, code) {
  return fetchJson('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ code, client_id: env.YOUTUBE_CLIENT_ID, client_secret: env.YOUTUBE_CLIENT_SECRET, redirect_uri: env.YOUTUBE_REDIRECT_URI, grant_type: 'authorization_code' })
  });
}

async function refresh(env, tokens) {
  if (!tokens.refresh_token) return tokens;
  const next = await fetchJson('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ refresh_token: tokens.refresh_token, client_id: env.YOUTUBE_CLIENT_ID, client_secret: env.YOUTUBE_CLIENT_SECRET, grant_type: 'refresh_token' })
  });
  return { ...tokens, ...next, refresh_token: tokens.refresh_token };
}

async function authorised(env, account, updateTokens, url) {
  let tokens = account.auth.tokens;
  let response = await fetch(url, { headers: { Authorization: `Bearer ${tokens.access_token}` } });
  if (response.status === 401 && tokens.refresh_token) {
    tokens = await refresh(env, tokens);
    updateTokens(tokens);
    response = await fetch(url, { headers: { Authorization: `Bearer ${tokens.access_token}` } });
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error?.message || 'YouTube API request failed.');
  return payload;
}

async function account(env, tokens) {
  const url = 'https://www.googleapis.com/youtube/v3/channels?part=id,snippet&mine=true';
  const payload = await fetchJson(url, { headers: { Authorization: `Bearer ${tokens.access_token}` } });
  const channel = payload.items?.[0];
  if (!channel) throw new Error('No YouTube channel was found for this Google account.');
  return { provider: 'youtube', externalId: channel.id, label: channel.snippet?.title || 'YouTube channel', channelId: channel.id, tokens };
}

async function listInteractions(env, account, updateTokens) {
  const url = new URL('https://www.googleapis.com/youtube/v3/commentThreads');
  url.searchParams.set('part', 'snippet,replies');
  url.searchParams.set('allThreadsRelatedToChannelId', account.channelId);
  url.searchParams.set('maxResults', '50');
  url.searchParams.set('order', 'time');
  url.searchParams.set('textFormat', 'plainText');
  const payload = await authorised(env, account, updateTokens, url);
  return (payload.items || []).map((thread) => {
    const comment = thread.snippet?.topLevelComment;
    const snippet = comment?.snippet || {};
    const text = snippet.textOriginal || snippet.textDisplay || '';
    return {
      id: `youtube-comment-${comment?.id || thread.id}`, accountId: account.id, provider: 'youtube', type: 'comment',
      title: snippet.videoId ? `YouTube · ${snippet.videoId}` : 'YouTube comment', content: text, sender: snippet.authorDisplayName || 'YouTube user',
      receivedAt: snippet.publishedAt, unread: true, requiresReply: Boolean(thread.snippet?.canReply && /\?|how|why|comment|pourquoi|como/i.test(text)),
      priority: 45 + Math.min(20, Number(snippet.likeCount || 0) * 2), contentIdea: /how|why|guide|tutorial|comment|pourquoi|como/i.test(text),
      sourceUrl: snippet.videoId ? `https://www.youtube.com/watch?v=${encodeURIComponent(snippet.videoId)}&lc=${encodeURIComponent(comment?.id || '')}` : ''
    };
  });
}

module.exports = { configured, authUrl, exchange, account, listInteractions };
