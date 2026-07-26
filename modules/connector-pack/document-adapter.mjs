export function createDocumentAdapter(client) {
  if (typeof client?.listDocuments !== 'function') throw new Error('client.listDocuments is required');

  return {
    async fetchSignals({ checkpoint, batchSize = 50 } = {}) {
      const response = await client.listDocuments({
        cursor: checkpoint?.cursor || null,
        limit: batchSize,
      });
      return {
        signals: (response.documents || []).map(document => ({
          source: 'document',
          connector: client.provider || 'documents',
          externalId: document.id,
          title: document.name || document.title || 'Document',
          body: document.extractedText || document.summary || '',
          occurredAt: document.modifiedAt || document.createdAt,
          metadata: {
            mimeType: document.mimeType || null,
            path: document.path || null,
            size: document.size || null,
          },
        })),
        checkpoint: { cursor: response.nextCursor || checkpoint?.cursor || null },
        hasMore: Boolean(response.hasMore),
      };
    },
  };
}
