import { readFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
const root = path.resolve(import.meta.dirname, '..');
const code = await readFile(path.join(root, 'config.js'), 'utf8');
const context = { window: {} }; vm.createContext(context); vm.runInContext(code, context);
const c = context.window.SUM_CONFIG || {};
const errors = [];
if (c.version !== '1.7.1-rc1') errors.push('Version must be 1.7.1-rc1.');
if (c.adminQaEnabled !== false) errors.push('Admin QA must be disabled for RC testing.');
if (c.commercialRelease !== false) errors.push('RC1 must not claim to be a commercial release.');
if (!c.storageKey) errors.push('Storage key missing.');
for (const file of ['mobile/native/ios/SigmaHealthPlugin.swift','mobile/native/android/SigmaHealthPlugin.kt','modules/native-health-bridge.js']) {
  try { await readFile(path.join(root,file)); } catch { errors.push(`Missing ${file}`); }
}
if (errors.length) { errors.forEach(e=>console.error(`FAIL: ${e}`)); process.exit(1); }
console.log('PASS: Sigma Life OS V1.7.1 RC1 baseline is coherent. External services remain opt-in configuration gates.');
