/**
 * SUM by Al.G.B.r. — lightweight licence and encrypted backup backend.
 * Deploy as a Google Apps Script web app. No external API key is required.
 */
const SUM_VERSION = '1.3.0';
const SHEETS = Object.freeze({ LICENSES: 'Licenses', BACKUPS: 'Backups', EVENTS: 'Events' });
const HEADERS = Object.freeze({
  Licenses: ['license_hash', 'email', 'plan', 'status', 'expires_at', 'max_devices', 'devices_json', 'created_at', 'last_validated_at', 'notes'],
  Backups: ['license_hash', 'email', 'payload_json', 'app_version', 'updated_at'],
  Events: ['created_at', 'event_name', 'email', 'details_json']
});

function doGet() {
  return json_({ ok: true, service: 'SUM Google Sheets backend', version: SUM_VERSION, time: new Date().toISOString() });
}

function doPost(e) {
  try {
    const body = JSON.parse((e.postData && e.postData.contents) || '{}');
    const action = String(body.action || '');
    if (action === 'validateLicense') return json_(validateLicense_(body));
    if (action === 'pushBackup') return json_(pushBackup_(body));
    if (action === 'pullBackup') return json_(pullBackup_(body));
    return json_({ ok: false, error: 'UNKNOWN_ACTION' });
  } catch (error) {
    logEvent_('server_error', '', { message: String(error && error.message || error) });
    return json_({ ok: false, error: 'SERVER_ERROR' });
  }
}

function validateLicense_(body) {
  const result = validateLicenseRecord_(body.email, body.licenseKey, body.deviceId, true);
  if (!result.ok) return result;
  logEvent_('license_validated', result.email, { deviceId: body.deviceId || '', appVersion: body.appVersion || '' });
  return { ok: true, plan: result.plan, status: result.status, expiresAt: result.expiresAt, type: 'subscription' };
}

function pushBackup_(body) {
  const validation = validateLicenseRecord_(body.email, body.licenseKey, body.deviceId, true);
  if (!validation.ok) return validation;
  if (!body.payload || typeof body.payload !== 'object') return { ok: false, error: 'INVALID_PAYLOAD' };

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sheet = getSheet_(SHEETS.BACKUPS);
    const hash = validation.licenseHash;
    const rows = sheet.getDataRange().getValues();
    const rowIndex = rows.findIndex((row, index) => index > 0 && row[0] === hash && normalizeEmail_(row[1]) === validation.email);
    const record = [hash, validation.email, JSON.stringify(body.payload), String(body.version || ''), new Date()];
    if (rowIndex >= 1) sheet.getRange(rowIndex + 1, 1, 1, record.length).setValues([record]);
    else sheet.appendRow(record);
    logEvent_('backup_pushed', validation.email, { deviceId: body.deviceId || '', version: body.version || '' });
    return { ok: true, updatedAt: new Date().toISOString() };
  } finally {
    lock.releaseLock();
  }
}

function pullBackup_(body) {
  const validation = validateLicenseRecord_(body.email, body.licenseKey, body.deviceId, true);
  if (!validation.ok) return validation;
  const sheet = getSheet_(SHEETS.BACKUPS);
  const rows = sheet.getDataRange().getValues();
  const row = rows.find((item, index) => index > 0 && item[0] === validation.licenseHash && normalizeEmail_(item[1]) === validation.email);
  if (!row) return { ok: false, error: 'NO_BACKUP' };
  logEvent_('backup_pulled', validation.email, { deviceId: body.deviceId || '' });
  return { ok: true, payload: JSON.parse(row[2]), appVersion: row[3], updatedAt: asIso_(row[4]) };
}

function validateLicenseRecord_(email, licenseKey, deviceId, registerDevice) {
  const provider = String(PropertiesService.getScriptProperties().getProperty('LICENSE_PROVIDER') || 'sheet').trim().toLowerCase();
  if (provider === 'lemon' || provider === 'lemonsqueezy') return validateLemonLicenseRecord_(email, licenseKey, deviceId, registerDevice);
  return validateSheetLicenseRecord_(email, licenseKey, deviceId, registerDevice);
}

function validateSheetLicenseRecord_(email, licenseKey, deviceId, registerDevice) {
  const normalizedEmail = normalizeEmail_(email);
  const normalizedKey = String(licenseKey || '').trim().toUpperCase();
  if (!normalizedEmail || !normalizedKey) return { ok: false, error: 'MISSING_CREDENTIALS' };

  const hash = hash_(normalizedKey);
  const sheet = getSheet_(SHEETS.LICENSES);
  const rows = sheet.getDataRange().getValues();
  const rowIndex = rows.findIndex((row, index) => index > 0 && row[0] === hash && normalizeEmail_(row[1]) === normalizedEmail);
  if (rowIndex < 1) return { ok: false, error: 'INVALID_LICENSE' };

  const row = rows[rowIndex];
  const plan = String(row[2] || '').toLowerCase();
  const status = String(row[3] || '').toLowerCase();
  const expiresAt = row[4] ? new Date(row[4]) : null;
  const maxDevices = Math.max(1, Number(row[5]) || 2);
  const devices = parseJsonArray_(row[6]);

  if (plan !== 'pro' || status !== 'active') return { ok: false, error: 'INACTIVE_LICENSE' };
  if (expiresAt && !Number.isNaN(expiresAt.getTime()) && expiresAt.getTime() < Date.now()) return { ok: false, error: 'EXPIRED_LICENSE' };
  const deviceResult = registerDevice_(sheet, rowIndex + 1, devices, deviceId, maxDevices, registerDevice);
  if (!deviceResult.ok) return deviceResult;
  sheet.getRange(rowIndex + 1, 9).setValue(new Date());
  return { ok: true, email: normalizedEmail, plan: 'pro', status: 'active', expiresAt: expiresAt && !Number.isNaN(expiresAt.getTime()) ? expiresAt.toISOString() : null, licenseHash: hash };
}

/**
 * Automatic low-touch licensing through Lemon Squeezy's public License API.
 * The payment platform creates and emails the key; no seller API token is needed
 * for this validation endpoint. Google Sheets remains the encrypted-backup store
 * and keeps a local device registry without storing the clear licence key.
 */
function validateLemonLicenseRecord_(email, licenseKey, deviceId, registerDevice) {
  const normalizedEmail = normalizeEmail_(email);
  const normalizedKey = String(licenseKey || '').trim();
  if (!normalizedEmail || !normalizedKey) return { ok: false, error: 'MISSING_CREDENTIALS' };

  const response = UrlFetchApp.fetch('https://api.lemonsqueezy.com/v1/licenses/validate', {
    method: 'post',
    headers: { Accept: 'application/json' },
    payload: { license_key: normalizedKey },
    muteHttpExceptions: true
  });
  if (response.getResponseCode() < 200 || response.getResponseCode() >= 300) return { ok: false, error: 'PROVIDER_UNAVAILABLE' };

  let data;
  try { data = JSON.parse(response.getContentText()); } catch (_) { return { ok: false, error: 'PROVIDER_RESPONSE' }; }
  if (!data || data.valid !== true) return { ok: false, error: 'INVALID_LICENSE' };

  const meta = data.meta || {};
  const providerLicense = data.license_key || {};
  const purchaseEmail = normalizeEmail_(meta.customer_email || meta.user_email || '');
  if (purchaseEmail && purchaseEmail !== normalizedEmail) return { ok: false, error: 'EMAIL_MISMATCH' };

  const allowedProductIds = propertyList_('LEMON_PRODUCT_IDS');
  const allowedVariantIds = propertyList_('LEMON_VARIANT_IDS');
  const productId = String(meta.product_id || '');
  const variantId = String(meta.variant_id || '');
  if (allowedProductIds.length && !allowedProductIds.includes(productId)) return { ok: false, error: 'WRONG_PRODUCT' };
  if (allowedVariantIds.length && !allowedVariantIds.includes(variantId)) return { ok: false, error: 'WRONG_VARIANT' };

  const providerStatus = String(providerLicense.status || '').toLowerCase();
  if (providerStatus === 'expired') return { ok: false, error: 'EXPIRED_LICENSE' };
  if (providerStatus === 'disabled') return { ok: false, error: 'INACTIVE_LICENSE' };
  const expiresAt = providerLicense.expires_at ? new Date(providerLicense.expires_at) : null;
  if (expiresAt && !Number.isNaN(expiresAt.getTime()) && expiresAt.getTime() < Date.now()) return { ok: false, error: 'EXPIRED_LICENSE' };

  const hash = hash_(`lemon:${normalizedKey.toLowerCase()}`);
  const sheet = getSheet_(SHEETS.LICENSES);
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const rows = sheet.getDataRange().getValues();
    let rowIndex = rows.findIndex((row, index) => index > 0 && row[0] === hash);
    const maxDevices = Math.max(1, Number(PropertiesService.getScriptProperties().getProperty('LEMON_MAX_DEVICES')) || 3);
    let devices = rowIndex >= 1 ? parseJsonArray_(rows[rowIndex][6]) : [];
    const deviceResult = registerDevice_(sheet, rowIndex >= 1 ? rowIndex + 1 : null, devices, deviceId, maxDevices, registerDevice);
    if (!deviceResult.ok) return deviceResult;
    devices = deviceResult.devices;

    const record = [
      hash,
      purchaseEmail || normalizedEmail,
      'pro',
      'active',
      expiresAt && !Number.isNaN(expiresAt.getTime()) ? expiresAt : '',
      maxDevices,
      JSON.stringify(devices),
      rowIndex >= 1 ? rows[rowIndex][7] || new Date() : new Date(),
      new Date(),
      `provider=lemon;product=${productId};variant=${variantId}`
    ];
    if (rowIndex >= 1) sheet.getRange(rowIndex + 1, 1, 1, record.length).setValues([record]);
    else sheet.appendRow(record);
  } finally {
    lock.releaseLock();
  }

  return {
    ok: true,
    email: purchaseEmail || normalizedEmail,
    plan: 'pro',
    status: 'active',
    expiresAt: expiresAt && !Number.isNaN(expiresAt.getTime()) ? expiresAt.toISOString() : null,
    licenseHash: hash,
    provider: 'lemon'
  };
}

function registerDevice_(sheet, rowNumber, devices, deviceId, maxDevices, shouldRegister) {
  const currentDevices = Array.isArray(devices) ? devices.slice() : [];
  if (!deviceId || currentDevices.includes(deviceId)) return { ok: true, devices: currentDevices };
  if (currentDevices.length >= maxDevices) return { ok: false, error: 'DEVICE_LIMIT' };
  if (shouldRegister) {
    currentDevices.push(deviceId);
    if (rowNumber) sheet.getRange(rowNumber, 7).setValue(JSON.stringify(currentDevices));
  }
  return { ok: true, devices: currentDevices };
}

function propertyList_(name) {
  return String(PropertiesService.getScriptProperties().getProperty(name) || '')
    .split(',').map((value) => value.trim()).filter(Boolean);
}

function setupSUM() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(HEADERS).forEach((name) => {
    let sheet = spreadsheet.getSheetByName(name);
    if (!sheet) sheet = spreadsheet.insertSheet(name);
    if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS[name]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS[name].length).setFontWeight('bold').setBackground('#eaf0ff');
    sheet.autoResizeColumns(1, HEADERS[name].length);
  });
  SpreadsheetApp.getUi().alert('SUM backend is ready. Use SUM Admin → Create licence.');
}

function onOpen() {
  SpreadsheetApp.getUi().createMenu('SUM Admin')
    .addItem('Setup sheets', 'setupSUM')
    .addItem('Create licence', 'menuCreateLicense')
    .addItem('Revoke licence', 'menuRevokeLicense')
    .addSeparator()
    .addItem('Use automatic Lemon licences', 'menuConfigureLemon')
    .addItem('Use manual Sheet licences', 'menuUseSheetLicensing')
    .addToUi();
}


function menuConfigureLemon() {
  const ui = SpreadsheetApp.getUi();
  const productPrompt = ui.prompt('Automatic Lemon licensing', 'Allowed Lemon product IDs, separated by commas. Leave blank to accept any product in the store:', ui.ButtonSet.OK_CANCEL);
  if (productPrompt.getSelectedButton() !== ui.Button.OK) return;
  const variantPrompt = ui.prompt('Automatic Lemon licensing', 'Allowed variant IDs, separated by commas. Leave blank to accept all variants of the allowed products:', ui.ButtonSet.OK_CANCEL);
  if (variantPrompt.getSelectedButton() !== ui.Button.OK) return;
  const devicePrompt = ui.prompt('Automatic Lemon licensing', 'Maximum devices per licence:', ui.ButtonSet.OK_CANCEL);
  if (devicePrompt.getSelectedButton() !== ui.Button.OK) return;
  const props = PropertiesService.getScriptProperties();
  props.setProperties({
    LICENSE_PROVIDER: 'lemon',
    LEMON_PRODUCT_IDS: productPrompt.getResponseText().trim(),
    LEMON_VARIANT_IDS: variantPrompt.getResponseText().trim(),
    LEMON_MAX_DEVICES: String(Math.max(1, Number(devicePrompt.getResponseText()) || 3))
  });
  ui.alert('Automatic Lemon licensing is active. Customers can use the licence key emailed by Lemon Squeezy.');
}

function menuUseSheetLicensing() {
  PropertiesService.getScriptProperties().setProperty('LICENSE_PROVIDER', 'sheet');
  SpreadsheetApp.getUi().alert('Manual Google Sheet licensing is active.');
}

function menuCreateLicense() {
  const ui = SpreadsheetApp.getUi();
  const emailPrompt = ui.prompt('SUM licence', 'Customer email:', ui.ButtonSet.OK_CANCEL);
  if (emailPrompt.getSelectedButton() !== ui.Button.OK) return;
  const durationPrompt = ui.prompt('SUM subscription licence', 'Duration in days: use 30 for monthly testing or 365 for annual testing.', ui.ButtonSet.OK_CANCEL);
  if (durationPrompt.getSelectedButton() !== ui.Button.OK) return;
  const duration = Math.max(1, Number(durationPrompt.getResponseText()) || 30);
  const result = createLicenseRecord(emailPrompt.getResponseText(), duration, 2, 'Created from SUM Admin menu');
  ui.alert(`Licence created for ${result.email}:\n\n${result.licenseKey}\n\nCopy it now. Only its hash is stored.`);
}

function createLicenseRecord(email, durationDays, maxDevices, notes) {
  setupIfNeeded_();
  const normalizedEmail = normalizeEmail_(email);
  if (!normalizedEmail) throw new Error('A valid customer email is required.');
  const licenseKey = generateLicenseKey_();
  const duration = Math.max(1, Number(durationDays) || 30);
  const expiresAt = new Date(Date.now() + duration * 86400000);
  getSheet_(SHEETS.LICENSES).appendRow([
    hash_(licenseKey), normalizedEmail, 'pro', 'active', expiresAt, Math.max(1, Number(maxDevices) || 2), '[]', new Date(), '', String(notes || '')
  ]);
  logEvent_('license_created', normalizedEmail, { durationDays: duration, maxDevices: Math.max(1, Number(maxDevices) || 2) });
  return { email: normalizedEmail, licenseKey: licenseKey, expiresAt: expiresAt.toISOString() };
}

function menuRevokeLicense() {
  const ui = SpreadsheetApp.getUi();
  const prompt = ui.prompt('Revoke SUM licence', 'Customer email:', ui.ButtonSet.OK_CANCEL);
  if (prompt.getSelectedButton() !== ui.Button.OK) return;
  const email = normalizeEmail_(prompt.getResponseText());
  const sheet = getSheet_(SHEETS.LICENSES);
  const rows = sheet.getDataRange().getValues();
  let count = 0;
  rows.forEach((row, index) => {
    if (index > 0 && normalizeEmail_(row[1]) === email && String(row[3]).toLowerCase() === 'active') {
      sheet.getRange(index + 1, 4).setValue('revoked');
      count += 1;
    }
  });
  logEvent_('license_revoked', email, { count: count });
  ui.alert(`${count} licence(s) revoked for ${email}.`);
}

function setupIfNeeded_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(HEADERS).forEach((name) => {
    let sheet = spreadsheet.getSheetByName(name);
    if (!sheet) sheet = spreadsheet.insertSheet(name);
    if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS[name]);
  });
}

function getSheet_(name) {
  setupIfNeeded_();
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
}

function logEvent_(eventName, email, details) {
  try { getSheet_(SHEETS.EVENTS).appendRow([new Date(), eventName, normalizeEmail_(email), JSON.stringify(details || {})]); } catch (_) { /* logging must not break the API */ }
}

function generateLicenseKey_() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const block = () => Array.from({ length: 4 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
  return `SUM-${block()}-${block()}-${block()}`;
}

function hash_(value) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, value, Utilities.Charset.UTF_8);
  return bytes.map((byte) => (`0${(byte & 255).toString(16)}`).slice(-2)).join('');
}
function normalizeEmail_(value) { return String(value || '').trim().toLowerCase(); }
function parseJsonArray_(value) { try { const parsed = JSON.parse(value || '[]'); return Array.isArray(parsed) ? parsed : []; } catch (_) { return []; } }
function asIso_(value) { const date = new Date(value); return Number.isNaN(date.getTime()) ? null : date.toISOString(); }
function json_(value) { return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON); }
