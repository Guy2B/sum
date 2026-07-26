export function detectPatterns(events = []) {
  const byType = {};
  const byHour = {};
  for (const event of events) {
    byType[event.type] = (byType[event.type] || 0) + 1;
    const hour = new Date(event.occurredAt).getHours();
    byHour[hour] = (byHour[hour] || 0) + 1;
  }
  const dominantType = Object.entries(byType).sort((a,b)=>b[1]-a[1])[0]?.[0] || null;
  const dominantHour = Number(Object.entries(byHour).sort((a,b)=>b[1]-a[1])[0]?.[0] ?? -1);
  return { byType, byHour, dominantType, dominantHour };
}
