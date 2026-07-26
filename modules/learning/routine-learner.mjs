export function learnRoutines(events = [], minOccurrences = 3) {
  const buckets = new Map();
  for (const event of events) {
    const key = `${event.type}:${new Date(event.occurredAt).getDay()}:${new Date(event.occurredAt).getHours()}`;
    const list = buckets.get(key) || [];
    list.push(event);
    buckets.set(key, list);
  }
  return [...buckets.entries()]
    .filter(([, list]) => list.length >= minOccurrences)
    .map(([key, list]) => {
      const [type, weekday, hour] = key.split(':');
      return { type, weekday: Number(weekday), hour: Number(hour), occurrences: list.length, confidence: Math.min(.95, .5 + list.length * .08) };
    });
}
