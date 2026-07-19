# Σ Life OS V1.7 — Core Intelligence Commercial Admin Beta

Σ Life OS by Al.G.B.r. turns authorised signals from work and life into a small number of explainable next actions.

## Product promise

- one active workspace: Student, Solo, Creator, Life or Nomad;
- a calm **Today** screen with up to three recommendations;
- one **Attention** queue for mail, social interactions, deadlines, opportunities and capacity signals;
- a realistic **Plan** based on time, load and energy;
- a **Sources** centre showing consent, connection state and last synchronisation;
- deterministic guidance first, optional local semantic and generative models second;
- browser-first PWA plus generated Capacitor iOS and Android projects.

## Administrative beta

This repository is intentionally configured as an admin test build:

```js
adminQaEnabled: true
commercialRelease: false
paymentMode: 'test'
```

The Admin QA console can seed Solo, Creator and Life scenarios, run browser/configuration checks and export a JSON report. Do not open public sales with this configuration.

## Run locally

```bash
npm run check
npm run serve
```

Open `http://localhost:8080/app.html`.

## Optional backends

- `backend/mail-connector` — Gmail, Outlook, Yahoo and GMX.
- `backend/social-connector` — Meta, YouTube, X, LinkedIn and TikTok adapters, subject to provider permissions and product approval.
- `backend/calendar-connector` — read-only Google Calendar and Microsoft Calendar OAuth import.
- `backend/local-ai-gateway` — optional self-hosted Ollama rewriting gateway.

Each backend has its own `.env.example`, `package-lock.json` and `npm run check` command.

## Mobile

`mobile/` contains generated Capacitor iOS and Android projects plus native health bridge sources. HealthKit is implemented as a Swift plugin source. Android Health Connect and Samsung Health include integration sources and explicit completion gates documented in `docs/MOBILE-HEALTH-V1.7.md`.

## Commercial gate

```bash
npm run release:check
npm run release:build
```

The release check deliberately fails until live payment, legal identity, support and secure backend URLs are configured and admin/demo access is disabled.

See:

- `docs/V1.7-PRODUCT-SPEC.md`
- `docs/ADMIN-TEST-PLAN-V1.7.md`
- `docs/COMMERCIAL-GO-LIVE-V1.7.md`
- `docs/GITHUB-UPGRADE-V1.7.md`
- `VALIDATION.md`
