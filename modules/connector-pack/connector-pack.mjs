import { createEmailAdapter } from './email-adapter.mjs';
import { createCalendarAdapter } from './calendar-adapter.mjs';
import { createDocumentAdapter } from './document-adapter.mjs';
import { createFinanceAdapter } from './finance-adapter.mjs';

export function installStandardConnectorPack(runtime, clients = {}) {
  const installed = [];

  const specs = [
    ['email', clients.email, createEmailAdapter, ['read-signals']],
    ['calendar', clients.calendar, createCalendarAdapter, ['read-signals', 'read-calendar']],
    ['documents', clients.documents, createDocumentAdapter, ['read-signals', 'read-documents']],
    ['finance', clients.finance, createFinanceAdapter, ['read-signals', 'read-finance']],
  ];

  for (const [id, client, factory, capabilities] of specs) {
    if (!client) continue;
    installed.push(runtime.install({
      id,
      name: client.name || id,
      version: '1.0.0',
      capabilities,
      authType: client.authType || 'oauth2',
    }, factory(client), ['read-signals']));
  }

  return installed;
}
