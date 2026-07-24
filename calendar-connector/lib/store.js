'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

function createStore(filePath, secret) {
  if (!secret || secret.length < 24) throw new Error('TOKEN_ENCRYPTION_KEY must contain at least 24 characters.');
  const key = crypto.createHash('sha256').update(secret).digest();
  const absolute = path.resolve(filePath);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });

  function decrypt(buffer) {
    const payload = JSON.parse(buffer.toString('utf8'));
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(payload.iv, 'base64'));
    decipher.setAuthTag(Buffer.from(payload.tag, 'base64'));
    return JSON.parse(Buffer.concat([decipher.update(Buffer.from(payload.data, 'base64')), decipher.final()]).toString('utf8'));
  }
  function encrypt(value) {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(JSON.stringify(value), 'utf8'), cipher.final()]);
    return JSON.stringify({ v: 1, iv: iv.toString('base64'), tag: cipher.getAuthTag().toString('base64'), data: encrypted.toString('base64') });
  }
  function read() {
    if (!fs.existsSync(absolute)) return { sessions: {} };
    try { return decrypt(fs.readFileSync(absolute)); } catch (error) { throw new Error(`Encrypted mail store could not be read: ${error.message}`); }
  }
  function write(data) {
    const temp = `${absolute}.tmp`;
    fs.writeFileSync(temp, encrypt(data), { mode: 0o600 });
    fs.renameSync(temp, absolute);
  }
  function getSession(sessionId) {
    const data = read();
    return data.sessions[sessionId] || { accounts: [], createdAt: new Date().toISOString() };
  }
  function updateSession(sessionId, mutator) {
    const data = read();
    const session = data.sessions[sessionId] || { accounts: [], createdAt: new Date().toISOString() };
    mutator(session);
    session.updatedAt = new Date().toISOString();
    data.sessions[sessionId] = session;
    write(data);
    return session;
  }
  return { getSession, updateSession };
}
module.exports = { createStore };
