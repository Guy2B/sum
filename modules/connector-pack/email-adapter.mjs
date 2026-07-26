export function createEmailAdapter(client) {
  if (typeof client?.listMessages !== 'function') throw new Error('client.listMessages is required');

  return {
    async fetchSignals({ checkpoint, batchSize = 50 } = {}) {
      const response = await client.listMessages({
        cursor: checkpoint?.cursor || null,
        limit: batchSize,
      });
      return {
        signals: (response.messages || []).map(message => ({
          source: 'email',
          connector: client.provider || 'email',
          externalId: message.id,
          subject: message.subject,
          body: message.body || message.snippet || '',
          sender: message.from || null,
          occurredAt: message.receivedAt || message.date,
          metadata: {
            threadId: message.threadId || null,
            unread: Boolean(message.unread),
            labels: message.labels || [],
          },
        })),
        checkpoint: { cursor: response.nextCursor || checkpoint?.cursor || null },
        hasMore: Boolean(response.hasMore),
      };
    },
  };
}
