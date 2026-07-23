# Sigma Intelligence Engine V1 — Phase 2

This phase integrates the foundation into the existing Today page through an explicit **Intelligence V1 Beta** toggle.

## Included

- Parallel execution of the legacy V1.7 engine and Sigma Intelligence V1.
- Read-only rendering of up to five real normalized signals.
- Separate importance, urgency, impact and confidence scores.
- Deterministic explanations and uncertainty notices.
- Initial project, objective, contact and company relationship resolution.
- Approval-required badges for sensitive recommendations.

## Safety boundary

The beta view performs no state mutation, Firestore write, message send, calendar update, archive, deletion or external action. The existing Today view remains the default.

## Next gate

Before persistence is introduced, compare the beta ranking with the legacy view on real anonymised workspaces and record false positives, missed deadlines and incorrect relations.
