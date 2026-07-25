import { proposeSignalAction } from './action-proposals.js';
import { explainPriority } from './priority-explanation.js';
export function runSignalScenario(signal, context = {}) {
  return {
    signal,
    explanation: explainPriority(signal, context),
    action: proposeSignalAction(signal),
    edition: context.activeEdition ?? 'personal'
  };
}
