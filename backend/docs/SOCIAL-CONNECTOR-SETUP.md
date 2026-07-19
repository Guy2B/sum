# Social Connector setup

The Social Connector is optional. GitHub Pages continues to host the static application, while this Node.js service handles OAuth and API requests.

## Local test

```bash
cd backend/social-connector
cp .env.example .env
npm install
npm run check
npm start
```

Then edit public `config.js`:

```js
socialApiBaseUrl: 'http://localhost:8888',
```

## Meta

Create a Meta Business app and configure the callback:

```text
https://YOUR-SOCIAL-API/api/social/callback/meta
```

Test accounts you own or manage can use Standard Access. Serving external professional accounts requires the relevant Advanced Access and app review.

## YouTube

Enable the YouTube Data API and configure:

```text
https://YOUR-SOCIAL-API/api/social/callback/youtube
```

The connector requests read-only YouTube access and lists channel comment threads.

## Security

- Do not commit `.env`.
- Use long, independent values for `SESSION_SECRET` and `TOKEN_ENCRYPTION_KEY`.
- Restrict `APP_ORIGINS` to your real application origins.
- Use HTTPS and `COOKIE_SAME_SITE=none` when the static app and connector use different sites.
- Store the encrypted connector data on persistent storage or migrate it to a database before commercial production.
