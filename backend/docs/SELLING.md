# Selling SUM with limited intervention

## Recommended first offer

- SUM Free: hosted application, no account, local data.
- SUM Pro Monthly: all modules with flexible recurring access.
- SUM Pro Annual: the same plan with a discounted annual price.

### Passive-first option: Lemon Squeezy

Enable licence keys on the SUM product, then configure **SUM Admin → Use automatic Lemon licences**. The platform creates and emails each licence after payment; the customer activates it directly in SUM. No manual fulfilment is required.

### Marketplace fallback

For a platform without compatible automatic keys, use the manual Sheet workflow:

1. customer pays;
2. choose **SUM Admin → Create licence**;
3. send the generated key with the saved email below.

This fallback is useful for a private beta or a second marketplace.

## Suggested saved email

Subject: Your SUM Pro licence

```text
Thank you for purchasing SUM Pro.

Purchase email: [customer email]
Licence key: [generated key]

Open SUM → Account & Plan, then enter the same email and licence key.
Please keep the key private. It is also used to decrypt your optional cloud backup.

Start here: [your app URL]
Help: [your support URL]
```

## Distribution assets already included

- landing page;
- product logo and app icons;
- Free tier;
- upgrade screen;
- monthly and annual price presentation;
- licence activation;
- support and legal pages;
- installable PWA.

For marketplace listings, capture screenshots from:

- dashboard;
- Smart Coach recommendations;
- dark mode;
- project view;
- finance chart;
- mobile layout.

## Metrics worth observing

Do not add complex analytics to the first privacy-focused version. The minimum useful commercial numbers come from the checkout and Google Sheet:

- landing-page visits from the host;
- Free app starts;
- completed payments;
- licences created;
- licence validations;
- encrypted backups used;
- refunds;
- support requests.

Use the automatic Lemon path when possible. Add provider-specific webhooks only if later commercial requirements cannot be covered by hosted licence keys.
