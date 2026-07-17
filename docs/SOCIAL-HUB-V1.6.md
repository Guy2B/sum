# Σ Social Hub V1.6

## Customer experience

Σ Social presents one attention queue rather than one permanent panel per network.

The user can:

- connect a professional network;
- see priority interactions, replies, comments and content ideas;
- create a task from an interaction;
- schedule a reply reminder;
- mark an interaction handled;
- open the original network when a source link is available.

## Supported real connectors

- Instagram Business and Creator accounts through Meta, after the required app review and permissions.
- Facebook Pages through Meta, after the required app review and permissions.
- YouTube channel comments through Google OAuth and the YouTube Data API.

## Capability notices

X, LinkedIn and TikTok appear in the connection chooser with an honest explanation. They do not pretend to provide a working private-message inbox.

## Demo mode

Leave `socialApiBaseUrl` empty in `config.js`. Clicking Instagram, Facebook or YouTube loads local demonstration interactions. X, LinkedIn and TikTok can also load explicit demo data from their information dialog.

## Production mode

Deploy `backend/social-connector`, then set:

```js
socialApiBaseUrl: 'https://your-social-api.example.com',
```

The front end never receives OAuth client secrets or access tokens.
