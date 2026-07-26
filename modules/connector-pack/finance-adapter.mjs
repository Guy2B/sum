export function createFinanceAdapter(client) {
  if (typeof client?.listTransactions !== 'function') throw new Error('client.listTransactions is required');

  return {
    async fetchSignals({ checkpoint, batchSize = 50 } = {}) {
      const response = await client.listTransactions({
        cursor: checkpoint?.cursor || null,
        limit: batchSize,
      });
      return {
        signals: (response.transactions || []).map(transaction => ({
          source: 'bank',
          connector: client.provider || 'finance',
          externalId: transaction.id,
          title: transaction.title || transaction.merchant || 'Mouvement bancaire',
          body: transaction.description || '',
          occurredAt: transaction.bookedAt || transaction.date,
          metadata: {
            amount: transaction.amount,
            currency: transaction.currency || 'EUR',
            status: transaction.status || null,
            accountId: transaction.accountId || null,
          },
        })),
        checkpoint: { cursor: response.nextCursor || checkpoint?.cursor || null },
        hasMore: Boolean(response.hasMore),
      };
    },
  };
}
