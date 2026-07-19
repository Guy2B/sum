import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import process from 'node:process';

const root = path.resolve(import.meta.dirname, '..');
const errors = [];
const warnings = [];

async function exists(relative) {
  try { await access(path.join(root, relative)); return true; } catch { return false; }
}

function requireValue(config, key, label = key) {
  const value = config[key];
  if (typeof value !== 'string' || !value.trim()) errors.push(`${label} is missing.`);
  return value;
}

function requireHttps(value, label) {
  if (!value) return;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') errors.push(`${label} must use HTTPS.`);
  } catch {
    errors.push(`${label} is not a valid URL.`);
  }
}

const configCode = await readFile(path.join(root, 'config.js'), 'utf8');
const context = { window: {} };
vm.createContext(context);
vm.runInContext(configCode, context, { filename: 'config.js' });
const config = context.window.SUM_CONFIG || {};

if (config.adminQaEnabled !== false) errors.push('adminQaEnabled must be false.');
if (config.commercialRelease !== true) errors.push('commercialRelease must be true.');
if (config.paymentMode !== 'live') errors.push("paymentMode must be 'live'.");
if (config.allowCheckoutSimulationOnLocalhost !== false) errors.push('Checkout simulation must be disabled.');
if (config.allowDemoLicenseOnLocalhost !== false) errors.push('Demo licences must be disabled.');
if (config.allowOwnerPreviewOnLocalhost !== false) errors.push('Owner preview must be disabled.');
if (config.demoLicense) warnings.push('Remove demoLicense from the public commercial configuration.');
if (config.ownerPreviewCode) warnings.push('Remove ownerPreviewCode from the public commercial configuration.');

for (const [key, label] of [
  ['monthlyCheckoutUrl', 'Monthly checkout URL'],
  ['annualCheckoutUrl', 'Annual checkout URL'],
  ['customerPortalUrl', 'Customer portal URL'],
  ['supportEmail', 'Support email'],
  ['legalEntity', 'Legal entity'],
  ['legalAddress', 'Legal address'],
  ['legalCountry', 'Legal country'],
  ['mailApiBaseUrl', 'Mail API URL'],
  ['socialApiBaseUrl', 'Social API URL'],
  ['calendarApiBaseUrl', 'Calendar API URL']
]) requireValue(config, key, label);

for (const [key, label] of [
  ['monthlyCheckoutUrl', 'Monthly checkout URL'],
  ['annualCheckoutUrl', 'Annual checkout URL'],
  ['customerPortalUrl', 'Customer portal URL'],
  ['mailApiBaseUrl', 'Mail API URL'],
  ['socialApiBaseUrl', 'Social API URL'],
  ['calendarApiBaseUrl', 'Calendar API URL'],
  ['localAiGatewayUrl', 'Local AI gateway URL'],
  ['calendarApiBaseUrl', 'Calendar API URL']
]) requireHttps(config[key], label);

if (config.supportEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.supportEmail)) {
  errors.push('Support email is invalid.');
}

const requiredFiles = [
  'index.html', 'app.html', 'app.js', 'style.css', 'site.css', 'site.js',
  'manifest.webmanifest', 'service-worker.js', 'legal/privacy.html',
  'legal/terms.html', 'legal/support.html', 'modules/intelligence-v17.js',
  'modules/experience-v17.js', 'modules/local-ai.js'
];
for (const file of requiredFiles) if (!(await exists(file))) errors.push(`Missing required file: ${file}`);

const legalText = await Promise.all(['legal/privacy.html', 'legal/terms.html', 'legal/support.html']
  .map(async (file) => (await exists(file)) ? readFile(path.join(root, file), 'utf8') : ''));
if (legalText.some((text) => /À COMPLÉTER|TO COMPLETE|example\.com|votre société|your company/i.test(text))) {
  errors.push('Legal pages still contain placeholders.');
}

const publicText = await Promise.all(['index.html', 'app.html', 'site.js', 'app.js', 'config.js']
  .map((file) => readFile(path.join(root, file), 'utf8')));
if (publicText.join('\n').includes('SUM-OWNER-PREVIEW')) warnings.push('Owner preview token is still present in public sources.');

console.log('Σ V1.7 commercial release check');
for (const warning of warnings) console.warn(`WARN: ${warning}`);
if (errors.length) {
  for (const error of errors) console.error(`FAIL: ${error}`);
  console.error(`\nRelease blocked: ${errors.length} required item(s) remain.`);
  process.exit(1);
}
console.log('PASS: configuration and required files are ready for a commercial static build.');
