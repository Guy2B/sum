export function replanDay(plan, event = {}) {
  const scheduled = [...(plan?.scheduled || [])];
  const deferred = [...(plan?.deferred || [])];

  if (event.type === 'complete') {
    return {
      ...plan,
      scheduled: scheduled.filter(item => item.id !== event.actionId),
      completed: [...(plan.completed || []), ...scheduled.filter(item => item.id === event.actionId)],
      replannedAt: new Date().toISOString(),
    };
  }

  if (event.type === 'delay') {
    const delayed = scheduled.find(item => item.id === event.actionId);
    return {
      ...plan,
      scheduled: scheduled.filter(item => item.id !== event.actionId),
      deferred: delayed ? [...deferred, { ...delayed, deferReason: event.reason || 'Reporté par l’utilisateur.' }] : deferred,
      replannedAt: new Date().toISOString(),
    };
  }

  if (event.type === 'new-critical' && event.action) {
    return {
      ...plan,
      scheduled: [{ ...event.action, sequence: 1 }, ...scheduled].map((item, index) => ({ ...item, sequence: index + 1 })),
      replannedAt: new Date().toISOString(),
    };
  }

  return { ...plan, replannedAt: new Date().toISOString() };
}
