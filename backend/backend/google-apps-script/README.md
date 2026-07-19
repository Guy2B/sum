# SUM Google Sheets backend

This Apps Script is the lightweight commercial backend for SUM. It provides:

1. Pro licence validation;
2. an optional automatic Lemon Squeezy licence path;
3. a manual Google Sheet licence path for other marketplaces;
4. encrypted browser-side backup storage;
5. restore and event logging.

The readable workspace never reaches the server. The browser encrypts it with AES-GCM before upload. The Sheet stores ciphertext only. Clear licence keys are not stored in the Sheet.

## Installation

1. Create a blank Google Sheet owned by the business account.
2. Open **Extensions → Apps Script**.
3. Replace the editor contents with `Code.gs` and add the supplied `appsscript.json` in Project Settings.
4. Run `setupSUM` once and grant the requested Google permissions.
5. Choose **Deploy → New deployment → Web app**.
6. Execute as yourself and allow access to anyone using the app.
7. Copy the deployed `/exec` URL into `config.js` as `appsScriptUrl`.
8. Reload the Google Sheet to display the **SUM Admin** menu.

Use a POST request with `Content-Type: text/plain` as the application already does. Before launch, test the deployed endpoint from the final production domain because browser and deployment policies can differ.

## Recommended: automatic Lemon Squeezy licences

This is the lowest-intervention sales path.

1. Create the SUM Pro product with monthly and annual variants in Lemon Squeezy.
2. Enable licence-key generation and choose an activation limit.
3. In the Google Sheet, choose **SUM Admin → Use automatic Lemon licences**.
4. Enter the allowed product IDs and, optionally, variant IDs.
5. Put the monthly and annual hosted checkout URLs in `config.js`.

After payment, Lemon Squeezy generates and emails the key. The customer enters the purchase email and key in SUM. Apps Script validates the key through Lemon's License API, checks the product/variant allowlist and records only a hash plus the device registry. No seller API token is required for the public licence-validation endpoint.

Subscriptions are rechecked against the provider whenever the app validates a licence or uses cloud backup. Expired or disabled keys are rejected.

## Alternative: manual marketplace licences

For Gumroad, Paddle, direct invoices or an early private beta:

1. choose **SUM Admin → Use manual Sheet licences**;
2. after payment, choose **SUM Admin → Create licence**;
3. send the generated key to the customer's purchase email.

The key is shown once; only its SHA-256 hash remains in the Sheet.

## Sheets

- `Licenses`: hashes, plans, status, expiry and registered devices;
- `Backups`: encrypted payloads only;
- `Events`: operational events and errors.

## Security and scale boundary

This is an economical commercial-beta backend, not an enterprise identity platform. Protect the owner Google account with MFA, restrict Sheet access, keep backups, monitor Apps Script quotas and migrate to a dedicated database/backend if traffic, compliance or support needs become significant.
