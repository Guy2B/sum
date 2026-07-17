# SUM Mail Connector V1.5

This optional backend keeps OAuth tokens and IMAP app passwords out of the browser. The encrypted store is intended for a small beta; migrate to a managed database and proper user authentication before scaling.

## Providers

- Gmail: OAuth 2.0 + Gmail read-only scope.
- Outlook / Microsoft 365: OAuth 2.0 + delegated `Mail.Read`.
- Yahoo Mail: IMAP over TLS with a Yahoo-generated app password.
- GMX: IMAP over TLS after IMAP is enabled; an app-specific password may be required.

## Start locally

```bash
cp .env.example .env
npm install
npm run check
npm start
```

Set `mailApiBaseUrl: 'http://localhost:8787'` in the web app `config.js`, serve the web app at `http://localhost:8080`, then open the Mail Hub.

## Security notes

- Never commit `.env` or `.data/`.
- Use long unrelated values for `SESSION_SECRET` and `TOKEN_ENCRYPTION_KEY`.
- Use HTTPS in production.
- If the frontend and API are on different sites, use `COOKIE_SAME_SITE=none` and HTTPS.
- This release reads mail; it does not send, delete or modify messages.
- Gmail and Microsoft production apps may require provider review depending on requested scopes and audience.
