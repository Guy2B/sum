'use strict';
const ONLINE = window.SIGMA_ONLINE_CONFIG || {};
window.SUM_CONFIG = Object.freeze({
  appName: 'Σ Life OS',
  brandName: 'Al.G.B.r.',
  version: '2.1.0-beta-google-connected',
  mailApiBaseUrl: String(ONLINE.mailApiBaseUrl || ''), // e.g. 'http://localhost:8787'; empty keeps Mail Hub in explicit demo mode
  socialApiBaseUrl: String(ONLINE.socialApiBaseUrl || ''), // e.g. 'http://localhost:8888'; empty keeps Σ Social in explicit demo mode
  localAiMode: 'auto', // guided + semantic everywhere; generative is optional
  allowLocalAiOnDevice: true,
  allowSemanticAiOnDevice: true,
  localAiGatewayUrl: String(ONLINE.localAiGatewayUrl || ''), // optional self-hosted Ollama gateway, usable from Chrome, Edge, Safari and Firefox
  calendarApiBaseUrl: String(ONLINE.calendarApiBaseUrl || ''),
  adminQaEnabled: false, // MUST be false in a public commercial build
  commercialRelease: false,
  storageKey: 'sum-algbr-state-v1',
  themeKey: 'sum-algbr-theme',
  languageKey: 'sum-algbr-language',

  // Public endpoints — complete these before going live.
  appsScriptUrl: String(ONLINE.appsScriptUrl || ''),

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
