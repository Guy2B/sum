# Sigma Intelligence Foundation V1

Status: foundation implementation, local read-only analysis.

## Scope

- Unified `SigmaSignal` schema version 1.
- Validation and deterministic adapters for mail, social interactions, tasks, calendar events and opportunities.
- Rule-based classification, separate importance/urgency/impact/confidence scores, recommendation and approval flag.
- Idempotent in-memory deduplication by `domain|provider|sourceId`.
- Diagnostic comparison with the legacy `SUM_INTELLIGENCE_V17` engine.

## Safety boundary

This foundation does not write to Firestore, change the calendar, send messages, delete content or execute recommendations. It only analyzes data already present in the current workspace. Sensitive actions are marked `requiresApproval` and receive approval status `pending`.

## Browser diagnostic

After the application loads, run:

```js
SigmaIntelligenceDiagnostics.compare()
```

The result compares counts, categories and priority scores between V1 and the legacy engine without changing the user workspace.

## Next gated phase

Persist signals under user-scoped Firestore collections only after the comparison report and security rules are approved.
