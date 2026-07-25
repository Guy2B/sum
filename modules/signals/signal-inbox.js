export const SIGNAL_BUCKETS = ['critical','high','review','information','ignored'];
export function buildSignalInbox(signals = []) {
  const inbox = Object.fromEntries(SIGNAL_BUCKETS.map(k => [k, []]));
  for (const signal of signals) {
    const bucket = SIGNAL_BUCKETS.includes(signal.bucket) ? signal.bucket : 'review';
    inbox[bucket].push({ ...signal });
  }
  for (const bucket of SIGNAL_BUCKETS) {
    inbox[bucket].sort((a,b) => (b.priorityScore ?? 0) - (a.priorityScore ?? 0));
  }
  return inbox;
}
