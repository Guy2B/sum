# V1.7 commercial go-live

The admin beta is not a public commercial build. Complete every gate below before sales.

## Configuration

- set `adminQaEnabled` to `false`;
- set `commercialRelease` to `true`;
- set `paymentMode` to `live`;
- disable checkout simulation, demo licence and owner preview;
- configure monthly, annual and customer-portal URLs;
- configure legal entity, address, country and support email;
- configure HTTPS mail and social backend URLs;
- optionally configure an HTTPS local-AI gateway and calendar backend.

Run:

```bash
npm run release:check
npm run release:build
```

The production static files are created only when the release gate passes.

## Security

- use a password manager or secret manager for provider secrets;
- use independent long random session and encryption secrets;
- use a persistent encrypted database or protected disk for production tokens;
- rotate secrets after any accidental exposure;
- configure exact CORS origins and exact OAuth callback URLs;
- configure CSP, rate limits, structured logs, alerting and backups;
- document retention and deletion periods;
- perform dependency and penetration checks before opening public OAuth.

## Payments and entitlement

The current client-side licence flow is suitable for admin testing only. Production requires server-verified webhook events, a durable customer/entitlement record, restore-purchase paths for mobile stores and protection against replayed or forged licences.

## Provider approvals

Do not advertise a provider capability until its production application, scopes, review and account-type constraints have been validated with a real external test account.

## Health distribution

Apple and Samsung health access must be tested in signed mobile applications. Complete store privacy declarations, consent text, data deletion and provider-specific distribution/partner steps before claiming live support.
