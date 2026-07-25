# Sigma Sprints 16 to 20 — Common Intelligence Consolidation

These sprints implement the first five actions after Sprint 15 under `SIGMA-MASTER-PLAN.md`.

## Sprint 16 — Common Entity Model

Adds a canonical entity envelope for all life domains: owner, source, timestamps, confidence, privacy, evidence and relationships. Domain modules should extend `attributes` instead of redefining the envelope.

## Sprint 17 — Temporal Engine

Adds validated time intervals, conflict detection, free-slot calculation and temporal state classification. The engine is independent from calendar providers.

## Sprint 18 — Evidence Engine

Adds normalized evidence, weighted source reliability, contradiction handling, confidence scoring and human-readable rationale. Conclusions remain estimates, not unsupported certainty.

## Sprint 19 — Privacy Engine

Adds workspace isolation, role checks, purpose limitation, privacy levels, retention evaluation, memory/export controls and field redaction.

## Sprint 20 — Progress Engine

Adds declared/measured/estimated progress records, evidence links, weighted progress, confidence, trend and review scheduling.

## Completion evidence

All five modules have deterministic Node tests and are included in `npm run verify`. They are common services only; production persistence and UI integration remain future work.
