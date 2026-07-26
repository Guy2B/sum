import { createConsentLedger } from './consent-ledger.mjs';
import { createRetentionPolicy, evaluateRetention } from './data-retention.mjs';
import { buildPrivacyReport } from './privacy-report.mjs';
import { exportUserData } from './export-engine.mjs';
import { buildDeletionPlan } from './deletion-plan.mjs';

export function createTrustCenter(state = {}) {
  const ledger = createConsentLedger(state.consents || []);
  let retentionPolicy = createRetentionPolicy(state.retentionPolicy || {});

  return {
    ledger,
    setRetentionPolicy(policy) {
      retentionPolicy = createRetentionPolicy(policy);
      return retentionPolicy;
    },
    retention(items, now) {
      return evaluateRetention(items, retentionPolicy, now);
    },
    report(input = {}) {
      return buildPrivacyReport({
        connectors: input.connectors || state.connectors || [],
        consents: ledger.snapshot(),
        retainedItems: input.retainedItems || state.retainedItems || [],
        auditEvents: input.auditEvents || state.auditEvents || [],
      });
    },
    export(input = {}) {
      return exportUserData({ ...state, ...input, consents: ledger.snapshot() });
    },
    deletionPlan(input = {}) {
      return buildDeletionPlan({
        userId: input.userId,
        connectors: input.connectors || state.connectors || [],
        retainedItems: input.retainedItems || state.retainedItems || [],
        preserveAudit: input.preserveAudit ?? true,
      });
    },
  };
}
