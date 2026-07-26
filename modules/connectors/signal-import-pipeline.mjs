import { normalizeSignal } from '../attention/signal-normalizer.mjs';
import { processUniversalInbox } from '../attention/universal-inbox.mjs';

export function importConnectorSignals(rawSignals = [], context = {}) {
  const accepted = [];
  const rejected = [];

  for (const raw of rawSignals) {
    try {
      accepted.push(normalizeSignal(raw));
    } catch (error) {
      rejected.push({ raw, error: error.message });
    }
  }

  const queue = processUniversalInbox(accepted, context);
  return {
    imported: accepted.length,
    rejected: rejected.length,
    rejectionDetails: rejected,
    queue,
  };
}
