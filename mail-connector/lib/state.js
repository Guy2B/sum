'use strict';
const crypto = require('node:crypto');
function encode(value) { return Buffer.from(JSON.stringify(value)).toString('base64url'); }
function signState(payload, secret) {
  const body = encode({ ...payload, ts: Date.now(), nonce: crypto.randomBytes(12).toString('hex') });
  const signature = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${signature}`;
}
function verifyState(value, secret, maxAgeMs = 10 * 60 * 1000) {
  const [body, signature] = String(value || '').split('.');
  if (!body || !signature) throw new Error('Invalid OAuth state.');
  const expected = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) throw new Error('Invalid OAuth state signature.');
  const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  if (!payload.ts || Date.now() - payload.ts > maxAgeMs) throw new Error('Expired OAuth state.');
  return payload;
}
module.exports = { signState, verifyState };
