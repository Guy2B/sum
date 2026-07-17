# SUM go-live checklist

The software is functional before these steps, but it is not ready to accept public payments until the commercial identity and external endpoints are configured.

## 1. Brand and ownership

- Confirm the final spelling: `Al.G.B.r.` and product name `SUM`.
- Search relevant trademark databases and app marketplaces before investing in promotion.
- Buy a domain and create a business support address.
- Replace the operator fields in `config.js`.
- Decide which individual or legal entity owns the code, brand, payment account and Google Sheet.

## 2. Hosted checkout

Create one SUM Pro product with two recurring variants:

- monthly subscription;
- annual subscription.

Copy the hosted checkout URL into `config.js`:

```js
monthlyCheckoutUrl: 'https://your-monthly-checkout-link',
annualCheckoutUrl: 'https://your-annual-checkout-link'
```

Recommended: enable the checkout platform's licence keys and use the automatic Lemon validation mode described in `backend/google-apps-script/README.md`. The manual Sheet mode remains available for other platforms.

## 3. Google Sheets backend

Follow `backend/google-apps-script/README.md`.

After deployment, copy the Apps Script `/exec` URL into:

```js
appsScriptUrl: 'https://script.google.com/macros/s/.../exec'
```

Configure either automatic Lemon licences or manual Sheet licences. Activate a test key in SUM, push an encrypted backup, clear the local test data and restore the backup.

## 4. Legal and customer-facing information

Complete and review:

- `legal/privacy.html`;
- `legal/terms.html`;
- refund and cancellation wording on the checkout page;
- company identity, address and support contact;
- payment provider and tax wording;
- jurisdictions and languages in which the product is sold.

The supplied pages are operational templates, not a substitute for legal advice.

## 5. Hosting

Upload the entire folder to a static HTTPS host. Keep the folder structure unchanged. Confirm that:

- `/index.html` loads the sales page;
- `/app.html` loads the application;
- `manifest.webmanifest` is served with a valid manifest content type;
- `service-worker.js` is accessible at the project root;
- all pages use HTTPS;
- direct links such as `/app.html#coach` work.

## 6. Final functional test

Test in English, French, German and Spanish:

1. complete onboarding;
2. change light/dark mode;
3. add, complete and delete a task;
4. create journal and learning entries;
5. capture and triage Inbox items;
6. verify the three essential tasks and optimal order;
7. create calendar events, habits and weekly goals;
8. use all five free Σ conversations;
9. confirm the sixth request opens the upgrade modal;
10. confirm Week, Month, Kanban and Eisenhower open the upgrade modal in Free;
11. activate a real Pro test licence;
12. test Week and Month dashboard views;
13. test Kanban, Eisenhower and monthly goals;
14. switch all languages;
15. add project, finance and wellbeing data;
16. run every contextual Σ command;
17. export and import a JSON backup;
18. push and restore an encrypted cloud backup;
19. install the PWA and reload while offline;
20. test mobile navigation.

## 7. Low-touch operating routine

Weekly, review:

- failed licence activations;
- Apps Script error logs;
- support messages;
- checkout refunds and chargebacks;
- the Events sheet for repeated errors.

Monthly, download a protected backup of the Google Sheet and test one restore with a non-production licence.
