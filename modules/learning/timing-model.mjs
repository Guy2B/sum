export function recommendTimeWindow(events = []) {
  const positive = events.filter(e => e.feedback?.accepted === true || e.feedback?.rating >= 4);
  const source = positive.length ? positive : events;
  if (!source.length) return { startHour: 9, endHour: 11, confidence: 0.3 };
  const hours = source.map(e => new Date(e.occurredAt).getHours()).sort((a,b)=>a-b);
  const median = hours[Math.floor(hours.length / 2)];
  return {
    startHour: Math.max(0, median - 1),
    endHour: Math.min(24, median + 1),
    confidence: Math.min(0.95, 0.4 + source.length * 0.05),
  };
}
