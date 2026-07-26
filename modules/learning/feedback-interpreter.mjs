export function interpretFeedback(feedback = {}) {
  if (feedback.accepted === true) return { signal: 'positive', weight: 1 };
  if (feedback.accepted === false) return { signal: 'negative', weight: -1 };
  if (typeof feedback.rating === 'number') {
    const normalized = Math.max(1, Math.min(5, feedback.rating));
    return { signal: normalized >= 4 ? 'positive' : normalized <= 2 ? 'negative' : 'neutral', weight: normalized - 3 };
  }
  if (feedback.action === 'snooze') return { signal: 'timing', weight: -0.5 };
  return { signal: 'neutral', weight: 0 };
}
