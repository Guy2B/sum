function toMinutes(value) {
  const [h, m] = String(value).split(':').map(Number);
  return h * 60 + m;
}
function fromMinutes(value) {
  const h = Math.floor(value / 60).toString().padStart(2, '0');
  const m = (value % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

export function buildTimeWindows({
  dayStart = '08:00',
  dayEnd = '18:00',
  fixedEvents = [],
  minimumWindow = 15,
} = {}) {
  const start = toMinutes(dayStart);
  const end = toMinutes(dayEnd);
  const events = [...fixedEvents]
    .map(event => ({ ...event, startMinute: toMinutes(event.start), endMinute: toMinutes(event.end) }))
    .filter(event => event.endMinute > start && event.startMinute < end)
    .sort((a, b) => a.startMinute - b.startMinute);

  const windows = [];
  let cursor = start;

  for (const event of events) {
    const eventStart = Math.max(start, event.startMinute);
    if (eventStart - cursor >= minimumWindow) {
      windows.push({ start: fromMinutes(cursor), end: fromMinutes(eventStart), minutes: eventStart - cursor });
    }
    cursor = Math.max(cursor, Math.min(end, event.endMinute));
  }

  if (end - cursor >= minimumWindow) {
    windows.push({ start: fromMinutes(cursor), end: fromMinutes(end), minutes: end - cursor });
  }

  return windows;
}
