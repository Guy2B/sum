'use strict';
const { ImapFlow } = require('imapflow');
const PROVIDERS = {
  yahoo: { host: 'imap.mail.yahoo.com', port: 993, secure: true },
  gmx: { host: 'imap.gmx.net', port: 993, secure: true }
};
function settings(provider) { const value = PROVIDERS[provider]; if (!value) throw new Error('Unsupported IMAP provider.'); return value; }
async function withClient(account, callback) {
  const server = settings(account.provider);
  const client = new ImapFlow({ ...server, auth: { user: account.email, pass: account.auth.appPassword }, logger: false, tls: { minVersion: 'TLSv1.2' } });
  try { await client.connect(); return await callback(client); } finally { try { await client.logout(); } catch {} }
}
async function validate(provider, email, appPassword) { return withClient({ provider, email, auth: { appPassword } }, async (client) => { const lock = await client.getMailboxLock('INBOX'); try { return { exists: client.mailbox.exists }; } finally { lock.release(); } }); }
async function listMessages(account) {
  return withClient(account, async (client) => {
    const lock = await client.getMailboxLock('INBOX');
    try {
      const total = client.mailbox.exists || 0; if (!total) return [];
      const range = `${Math.max(1, total - 49)}:*`; const result = [];
      for await (const message of client.fetch(range, { uid: true, envelope: true, flags: true, internalDate: true })) {
        const from = message.envelope?.from?.[0];
        result.push({ id: `${account.provider}:${message.uid}`, remoteId: String(message.uid), accountId: account.id, provider: account.provider, subject: message.envelope?.subject || '', sender: from ? `${from.name || ''}${from.address ? ` <${from.address}>` : ''}`.trim() : '', snippet: '', receivedAt: (message.internalDate || message.envelope?.date || new Date()).toISOString(), unread: !message.flags?.has('\\Seen'), importance: message.flags?.has('\\Flagged') ? 'high' : 'normal', needsReply: false, sourceUrl: '' });
      }
      return result.sort((a,b) => b.receivedAt.localeCompare(a.receivedAt));
    } finally { lock.release(); }
  });
}
module.exports = { validate, listMessages };
