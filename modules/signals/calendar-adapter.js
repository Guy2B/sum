export function normalizeCalendarEvent(event = {}) {
  if (!event.id) throw new Error('Calendar event id is required');
  return {
    id: `calendar:${event.id}`,
    source: 'calendar',
    sourceId: event.id,
    title: event.title ?? '(événement)',
    body: event.description ?? '',
    deadline: event.start ?? null,
    occurredAt: event.updatedAt ?? event.start ?? null,
    provenance: { provider: event.provider ?? 'generic-calendar', sourceId: event.id }
  };
}
