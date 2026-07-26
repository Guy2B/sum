export function createCalendarAdapter(client) {
  if (typeof client?.listEvents !== 'function') throw new Error('client.listEvents is required');

  return {
    async fetchSignals({ checkpoint, batchSize = 50 } = {}) {
      const response = await client.listEvents({
        cursor: checkpoint?.cursor || null,
        limit: batchSize,
      });
      return {
        signals: (response.events || []).map(event => ({
          source: 'calendar',
          connector: client.provider || 'calendar',
          externalId: event.id,
          title: event.title || 'Événement',
          body: event.description || '',
          occurredAt: event.updatedAt || event.start,
          deadline: event.start || null,
          metadata: {
            end: event.end || null,
            location: event.location || null,
            attendees: event.attendees || [],
          },
        })),
        checkpoint: { cursor: response.nextCursor || checkpoint?.cursor || null },
        hasMore: Boolean(response.hasMore),
      };
    },
  };
}
