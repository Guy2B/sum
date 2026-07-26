# Sigma hotfix V2 — compatibility Sprints 224 et 314

Le premier hotfix rétablissait l'export `validateReasoningEngine`, mais supposait
que l'ancien moteur exposait une méthode `reason()`.

Le moteur du Sprint 224 utilise un contrat historique différent. Le validateur
de compatibilité vérifie maintenant qu'une instance de moteur valide existe,
sans imposer l'API du nouvel orchestrateur.

Le validateur du Sprint 314 conserve son exigence `reason()`.
