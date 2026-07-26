# Sigma hotfix — compatibility Sprints 224 et 314

Le patch des Sprints 300–314 remplaçait `modules/reasoning/product-acceptance.mjs`
et supprimait involontairement l'export historique `validateReasoningEngine`
utilisé par `tests/reasoning/224.test.mjs`.

Ce hotfix rétablit les deux exports :

- `validateReasoningEngine`
- `validateReasoningOrchestrator`

Il exécute ensuite tous les tests du dossier `tests/reasoning` puis `npm run verify`.
