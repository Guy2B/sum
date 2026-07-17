'use strict';
window.SUM_CONFIG = Object.freeze({
  appName: 'Σ Life OS',
  brandName: 'Al.G.B.r.',
  version: '1.5.1',
  mailApiBaseUrl: '', // e.g. 'http://localhost:8787'; empty keeps Mail Hub in explicit demo mode
  localAiMode: 'auto', // 'auto', 'off' or 'chrome'; always falls back to the guided engine
  allowLocalAiOnDevice: true,
  storageKey: 'sum-algbr-state-v1',
  themeKey: 'sum-algbr-theme',
  languageKey: 'sum-algbr-language',

  // Public endpoints — complete these before going live.
  appsScriptUrl: '',

  // Hosted checkout. The URLs can come from Lemon Squeezy, PayPal or another provider.
  paymentProvider: 'lemon-squeezy',
  paymentMode: 'test', // 'test' or 'live'
  monthlyCheckoutUrl: '',
  annualCheckoutUrl: '',
  customerPortalUrl: '',
  allowCheckoutSimulationOnLocalhost: true,
  supportEmail: '',
  legalEntity: '',
  legalAddress: '',
  legalCountry: '',

  // Freemium limits.
  freeCoachLimit: 5,
  freeProjectLimit: 1,
  freeHabitLimit: 3,
  licenseGraceDays: 7,

  // Local testing. The owner preview is intentionally restricted to localhost/file://.
  allowDemoLicenseOnLocalhost: true,
  demoLicense: 'SUM-DEMO-2026',
  allowOwnerPreviewOnLocalhost: true,
  ownerPreviewCode: 'SUM-OWNER-PREVIEW',

  prices: {
    monthly: '8,90 € / mois',
    annual: '69 € / an'
  }
});
