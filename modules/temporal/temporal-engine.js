'use strict';

function instant(value, field) {
  const timestamp = Date.parse(value || '');
  if (!Number.isFinite(timestamp)) throw new TypeError(`${field} must be a valid date`);
  return timestamp;
}

function createInterval(input = {}) {
  const start = instant(input.start, 'start');
  const end = instant(input.end, 'end');
  if (end < start) throw new RangeError('end must not precede start');
  return { id: String(input.id || `interval_${start}`), start: new Date(start).toISOString(), end: new Date(end).toISOString(), timezone: input.timezone || 'UTC', kind: input.kind || 'busy', sourceId: input.sourceId || null };
}

function overlaps(left, right) {
  return instant(left.start, 'left.start') < instant(right.end, 'right.end') && instant(right.start, 'right.start') < instant(left.end, 'left.end');
}

function conflicts(intervals = []) {
  const sorted = intervals.map(createInterval).sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
  const result = [];
  for (let index = 0; index < sorted.length; index += 1) {
    for (let cursor = index + 1; cursor < sorted.length; cursor += 1) {
      if (Date.parse(sorted[cursor].start) >= Date.parse(sorted[index].end)) break;
      if (overlaps(sorted[index], sorted[cursor])) result.push({ leftId: sorted[index].id, rightId: sorted[cursor].id });
    }
  }
  return result;
}

function freeSlots(intervals = [], window = {}, options = {}) {
  const from = instant(window.start, 'window.start');
  const to = instant(window.end, 'window.end');
  const minimumMinutes = Math.max(1, Number(options.minimumMinutes || 30));
  const busy = intervals.map(createInterval).filter((item) => Date.parse(item.end) > from && Date.parse(item.start) < to).sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
  const merged = [];
  for (const item of busy) {
    const start = Math.max(from, Date.parse(item.start));
    const end = Math.min(to, Date.parse(item.end));
    const last = merged.at(-1);
    if (last && start <= last.end) last.end = Math.max(last.end, end);
    else merged.push({ start, end });
  }
  const slots = [];
  let cursor = from;
  for (const item of merged) {
    if ((item.start - cursor) / 60000 >= minimumMinutes) slots.push({ start: new Date(cursor).toISOString(), end: new Date(item.start).toISOString(), durationMinutes: (item.start - cursor) / 60000 });
    cursor = Math.max(cursor, item.end);
  }
  if ((to - cursor) / 60000 >= minimumMinutes) slots.push({ start: new Date(cursor).toISOString(), end: new Date(to).toISOString(), durationMinutes: (to - cursor) / 60000 });
  return slots;
}

function temporalState(item = {}, now = Date.now()) {
  const start = item.start || item.validFrom || item.createdAt;
  const end = item.end || item.validTo || item.targetAt;
  const startAt = start ? Date.parse(start) : NaN;
  const endAt = end ? Date.parse(end) : NaN;
  if (Number.isFinite(endAt) && endAt < now) return 'past';
  if (Number.isFinite(startAt) && startAt > now) return 'future';
  return 'active';
}

module.exports = { createInterval, overlaps, conflicts, freeSlots, temporalState };
