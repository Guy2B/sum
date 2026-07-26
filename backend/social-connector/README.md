# Σ Social Connector

Optional Node.js backend for the unified Σ Social Hub.

## Supported in this release

- Instagram professional accounts: Meta-authorised conversations and comments, subject to Meta app review.
- Facebook Pages: Page conversations and comments, subject to Meta app review.
- YouTube: channel comments through Google OAuth and the YouTube Data API.

X, LinkedIn and TikTok remain capability notices in the UI. They are not presented as working private-message inboxes.

## Start locally

```bash
cp .env.example .env
npm install
npm run check
npm start
```

Then set in the public `config.js`:

```js
socialApiBaseUrl: 'http://localhost:8888',
```

Never commit `.env`, OAuth secrets or token-store files.
