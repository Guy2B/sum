export class EditionSignalFeedback {
  constructor() { this.adjustments = new Map(); }
  record({ editionId, domain, delta }) {
    const key = `${editionId}:${domain}`;
    const next = Math.max(-20, Math.min(20, (this.adjustments.get(key) ?? 0) + Number(delta)));
    this.adjustments.set(key, next);
    return next;
  }
  apply(signal) {
    const delta = this.adjustments.get(`${signal.editionId}:${signal.domain}`) ?? 0;
    const score = Math.max(0, Math.min(100, Number(signal.priorityScore ?? 0) + delta));
    return { ...signal, priorityScore: score, learnedAdjustment: delta };
  }
}
