const SENSITIVE = new Set(['send','pay','sign','delete','publish']);
export function proposeSignalAction(signal = {}) {
  const action = signal.action ?? { type: 'review', title: 'Examiner le signal' };
  return {
    ...action,
    requiresApproval: action.requiresApproval ?? SENSITIVE.has(action.type),
    provenance: signal.provenance ?? { source: signal.source ?? 'unknown' }
  };
}
