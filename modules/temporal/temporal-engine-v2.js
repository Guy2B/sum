'use strict';

function toDate(value, name) { const d = new Date(value); if (Number.isNaN(d.getTime())) throw new TypeError(`${name} is invalid`); return d; }
class TemporalEngineV2 {
  createInterval({ id, start, end, recurrence = null, dependencies = [] }) {
    const s = toDate(start,'start'), e = toDate(end,'end'); if (e <= s) throw new RangeError('end must be after start');
    return Object.freeze({ id, start: s.toISOString(), end: e.toISOString(), recurrence, dependencies: [...dependencies] });
  }
  overlaps(a,b) { return toDate(a.start,'start') < toDate(b.end,'end') && toDate(b.start,'start') < toDate(a.end,'end'); }
  timeline(items) { return [...items].sort((a,b) => toDate(a.start,'start') - toDate(b.start,'start')); }
  dueState(item, now = new Date()) { const n = toDate(now,'now'), s = toDate(item.start,'start'), e = toDate(item.end,'end'); return n < s ? 'future' : n > e ? 'past' : 'active'; }
  expandDaily(interval, count) { if (!Number.isInteger(count) || count < 1) throw new RangeError('count must be positive'); const base = this.createInterval(interval); const duration = toDate(base.end,'end') - toDate(base.start,'start'); return Array.from({length:count},(_,i)=>{ const s=new Date(toDate(base.start,'start').getTime()+i*86400000); return this.createInterval({ ...base, id:`${base.id}:${i+1}`, start:s, end:new Date(s.getTime()+duration), recurrence:null }); }); }
  progress(interval, now = new Date()) { const s=toDate(interval.start,'start').getTime(), e=toDate(interval.end,'end').getTime(), n=toDate(now,'now').getTime(); return Math.max(0,Math.min(1,(n-s)/(e-s))); }
}
module.exports = { TemporalEngineV2 };
