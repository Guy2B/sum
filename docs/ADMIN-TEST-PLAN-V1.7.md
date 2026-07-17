# V1.7 admin test plan

## Before testing

Keep these admin-beta values in `config.js`:

```js
adminQaEnabled: true
commercialRelease: false
paymentMode: 'test'
```

Deploy the repository to the existing GitHub Pages test site. Do not add OAuth secrets to GitHub.

## Core journey

1. Complete onboarding and choose one workspace.
2. Open **Admin QA** and load the Solo scenario.
3. Verify that Today shows no more than three recommendations.
4. Open “Why this choice?” and verify that the explanation references actual task/message/event/health signals.
5. Create a task from an email or social item.
6. Snooze an item to tomorrow and verify the due date.
7. Mark an item handled and verify it leaves the active queue.
8. Open Plan and compare available capacity with planned work.
9. Switch to Creator and Life scenarios and repeat.
10. Export the Admin QA JSON report.

## Source journeys

### Mail

- enter a Gmail and Outlook address and verify provider detection;
- verify OAuth redirects only when a backend URL is configured;
- verify Yahoo/GMX request an application password, not the main password;
- disconnect a test account and verify its local messages disappear or are marked unavailable.

### Calendar

- connect Google and Microsoft test calendars;
- verify read-only imports and deduplication by external event ID;
- verify timezone, all-day events and disconnected-account cleanup.

### Social

- test the six provider cards and their capability notices;
- verify partial/approval-required status for providers without approved products;
- verify no automatic message or publication is sent;
- verify deduplication when a social interaction and its email notification share sender/title/time.

### Health

- browser: verify explicit demo mode;
- iOS build: request HealthKit permission by metric and reject at least one metric;
- Android build: test Health Connect permission denial and partial grant;
- Samsung build: verify the application reports partner SDK unavailable until the official AAR and registered signature are present.

## Browser matrix

Test current stable versions of Chrome, Edge, Safari and Firefox, plus iOS Safari and Android Chrome. The deterministic engine must work everywhere. Semantic AI may fall back to WASM. WebGPU and browser-native generation are optional accelerators.

## Accessibility and UX

- keyboard-only navigation;
- visible focus;
- 200% zoom;
- mobile widths 360, 390 and 430 px;
- reduced-motion system preference;
- light and dark mode;
- FR, EN, DE and ES;
- empty, loading, disconnected, partial, error and offline states.

## Acceptance gate

A controlled customer beta requires:

- zero blocker in `npm run check`;
- successful Admin QA report on each supported browser family;
- no secret in repository history;
- working data deletion and disconnection;
- legal pages completed;
- live backend monitoring and backups;
- at least five external beta users completing the first recommendation journey without assistance.
