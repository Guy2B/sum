'use strict';

const graphVersion = (env) => env.META_GRAPH_VERSION || 'v23.0';
const graph = (env) => `https://graph.facebook.com/${graphVersion(env)}`;

function configured(env) {
  return Boolean(env.META_APP_ID && env.META_APP_SECRET && env.META_REDIRECT_URI);
}

function scopes(provider) {
  if (provider === 'instagram') {
    return ['pages_show_list', 'pages_read_engagement', 'pages_manage_metadata', 'instagram_basic', 'instagram_manage_comments', 'instagram_manage_messages'];
  }
  return ['pages_show_list', 'pages_read_engagement', 'pages_manage_metadata', 'pages_messaging'];
}

function authUrl(env, state, provider) {
  const url = new URL(`https://www.facebook.com/${graphVersion(env)}/dialog/oauth`);
  url.searchParams.set('client_id', env.META_APP_ID);
  url.searchParams.set('redirect_uri', env.META_REDIRECT_URI);
  url.searchParams.set('state', state);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', scopes(provider).join(','));
  return url.toString();
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.error) throw new Error(payload.error?.message || `Meta request failed (${response.status}).`);
  return payload;
}

async function exchange(env, code) {
  const url = new URL(`${graph(env)}/oauth/access_token`);
  url.searchParams.set('client_id', env.META_APP_ID);
  url.searchParams.set('client_secret', env.META_APP_SECRET);
  url.searchParams.set('redirect_uri', env.META_REDIRECT_URI);
  url.searchParams.set('code', code);
  const short = await fetchJson(url);
  const longUrl = new URL(`${graph(env)}/oauth/access_token`);
  longUrl.searchParams.set('grant_type', 'fb_exchange_token');
  longUrl.searchParams.set('client_id', env.META_APP_ID);
  longUrl.searchParams.set('client_secret', env.META_APP_SECRET);
  longUrl.searchParams.set('fb_exchange_token', short.access_token);
  try { return await fetchJson(longUrl); } catch { return short; }
}

async function accounts(env, userToken, requestedProvider) {
  const url = new URL(`${graph(env)}/me/accounts`);
  url.searchParams.set('fields', 'id,name,access_token,instagram_business_account{id,username}');
  url.searchParams.set('limit', '100');
  url.searchParams.set('access_token', userToken);
  const result = await fetchJson(url);
  const rows = [];
  for (const page of result.data || []) {
    if (requestedProvider === 'facebook') {
      rows.push({ provider: 'facebook', externalId: page.id, label: page.name, accessToken: page.access_token, pageId: page.id });
    }
    if (requestedProvider === 'instagram' && page.instagram_business_account?.id) {
      rows.push({ provider: 'instagram', externalId: page.instagram_business_account.id, label: page.instagram_business_account.username || page.name, accessToken: page.access_token, pageId: page.id, instagramId: page.instagram_business_account.id });
    }
  }
  if (!rows.length) throw new Error(requestedProvider === 'instagram' ? 'No linked Instagram professional account was found.' : 'No manageable Facebook Page was found.');
  return rows;
}

function messageInteraction(account, message, conversation) {
  const sender = message.from?.name || message.from?.email || 'Social contact';
  const text = message.message || '';
  return {
    id: `meta-message-${message.id}`,
    accountId: account.id,
    provider: account.provider,
    type: 'message',
    title: text.slice(0, 90) || 'Social message',
    content: text,
    sender,
    receivedAt: message.created_time || conversation.updated_time,
    unread: true,
    requiresReply: /\?|please|could you|can you|price|quote|devis|tarif/i.test(text),
    priority: 55,
    contentIdea: false,
    sourceUrl: account.provider === 'facebook' ? `https://www.facebook.com/${account.pageId}/inbox/` : 'https://www.instagram.com/direct/inbox/'
  };
}

async function listConversations(env, account) {
  const base = account.provider === 'instagram' ? `${graph(env)}/${account.instagramId}/conversations` : `${graph(env)}/${account.pageId}/conversations`;
  const url = new URL(base);
  if (account.provider === 'instagram') url.searchParams.set('platform', 'instagram');
  url.searchParams.set('fields', 'id,updated_time,participants,messages.limit(8){id,created_time,from,to,message}');
  url.searchParams.set('limit', '25');
  url.searchParams.set('access_token', account.auth.accessToken);
  const result = await fetchJson(url);
  const rows = [];
  for (const conversation of result.data || []) {
    for (const message of conversation.messages?.data || []) rows.push(messageInteraction(account, message, conversation));
  }
  return rows;
}

async function listInstagramComments(env, account) {
  const mediaUrl = new URL(`${graph(env)}/${account.instagramId}/media`);
  mediaUrl.searchParams.set('fields', 'id,caption,permalink,timestamp');
  mediaUrl.searchParams.set('limit', '12');
  mediaUrl.searchParams.set('access_token', account.auth.accessToken);
  const media = await fetchJson(mediaUrl);
  const rows = [];
  for (const post of media.data || []) {
    const commentsUrl = new URL(`${graph(env)}/${post.id}/comments`);
    commentsUrl.searchParams.set('fields', 'id,text,timestamp,username,like_count');
    commentsUrl.searchParams.set('limit', '25');
    commentsUrl.searchParams.set('access_token', account.auth.accessToken);
    const comments = await fetchJson(commentsUrl).catch(() => ({ data: [] }));
    for (const comment of comments.data || []) {
      rows.push({
        id: `ig-comment-${comment.id}`, accountId: account.id, provider: 'instagram', type: 'comment',
        title: (post.caption || 'Instagram publication').slice(0, 90), content: comment.text || '', sender: comment.username || 'Instagram user',
        receivedAt: comment.timestamp || post.timestamp, unread: true, requiresReply: /\?|price|tarif|devis|how|comment|como/i.test(comment.text || ''),
        priority: 45 + Math.min(20, Number(comment.like_count || 0) * 2), contentIdea: /how|why|guide|tutorial|comment|pourquoi|como/i.test(comment.text || ''), sourceUrl: post.permalink || ''
      });
    }
  }
  return rows;
}

async function listFacebookComments(env, account) {
  const url = new URL(`${graph(env)}/${account.pageId}/feed`);
  url.searchParams.set('fields', 'id,message,permalink_url,created_time,comments.limit(20){id,message,from,created_time}');
  url.searchParams.set('limit', '10');
  url.searchParams.set('access_token', account.auth.accessToken);
  const result = await fetchJson(url).catch(() => ({ data: [] }));
  const rows = [];
  for (const post of result.data || []) {
    for (const comment of post.comments?.data || []) {
      rows.push({
        id: `fb-comment-${comment.id}`, accountId: account.id, provider: 'facebook', type: 'comment',
        title: (post.message || 'Facebook Page publication').slice(0, 90), content: comment.message || '', sender: comment.from?.name || 'Facebook user',
        receivedAt: comment.created_time || post.created_time, unread: true, requiresReply: /\?|price|tarif|devis|how|comment|como/i.test(comment.message || ''),
        priority: 48, contentIdea: /how|why|guide|tutorial|comment|pourquoi|como/i.test(comment.message || ''), sourceUrl: post.permalink_url || ''
      });
    }
  }
  return rows;
}

async function listInteractions(env, account) {
  const rows = [];
  try { rows.push(...await listConversations(env, account)); } catch { /* permissions may still be under review */ }
  if (account.provider === 'instagram') rows.push(...await listInstagramComments(env, account));
  if (account.provider === 'facebook') rows.push(...await listFacebookComments(env, account));
  return rows;
}

module.exports = { configured, authUrl, exchange, accounts, listInteractions };
