export function detectBehaviorAnomalies(events = [], baseline = {}) {
  const anomalies = [];
  for (const event of events) {
    const expectedHour = baseline[event.type]?.hour;
    if (expectedHour === undefined) continue;
    const actual = new Date(event.occurredAt).getHours();
    if (Math.abs(actual - expectedHour) >= 6) {
      anomalies.push({ eventId: event.id, type: event.type, expectedHour, actualHour: actual });
    }
  }
  return anomalies;
}
