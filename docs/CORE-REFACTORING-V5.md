# Sigma OS V5 — Core Refactoring, cleanup baseline

## Scope of this baseline

This release performs a non-functional repository cleanup before deeper architectural
changes. It does not change OAuth permissions, send messages, publish social content,
modify calendars, or add connectors.

## Active roots

- Web application: repository root (`app.html`, `app.js`, `modules/`, `assets/`).
- Firebase Functions: `functions/`.
- Intelligence Engine V1: `modules/intelligence/` and `functions/src/intelligence/`.
- Firestore configuration: root `firestore.rules` and `firestore.indexes.json`.

## Removed duplication

The former `backend/` directory contained 317 files:

- 265 were byte-for-byte duplicates of active root files;
- 11 conflicted with newer active root files;
- 41 existed only in the duplicated tree.

The duplicate tree has been removed. Backend-only standalone services were preserved under
`legacy/`, where they are explicitly outside the active application.

## Security cleanup

The following are excluded from source control:

- dependency directories;
- real `.env` files;
- Firebase local state and logs;
- private key and service-account patterns.

`functions/.env.example` documents public configuration names without real values.
OAuth client secrets continue to use Firebase Secret Manager / Functions parameters.

## Architecture rule

No active code may import from `legacy/`. The active root is the only deployable web tree.
A legacy service can be promoted only after ownership, runtime, security, tests, and data
contracts have been documented.

## Deferred refactoring

This baseline intentionally does not yet:

1. split every social OAuth function out of `functions/index.js`;
2. replace global browser services with ES modules;
3. migrate the complete workspace document to granular domain collections;
4. remove compatibility modules;
5. change connector behavior.

Those changes require separate, reversible pull requests and regression testing.
