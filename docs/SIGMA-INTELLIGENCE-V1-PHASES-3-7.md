# Sigma Intelligence Engine V1 — Phases 3 à 7

## Phase 3 — Persistance idempotente
Les SigmaSignal sont synchronisés par la callable `syncIntelligenceSignals`. Le client n'a aucun droit d'écriture direct. L'identifiant source sert de clé stable et les écritures utilisent `merge`.

## Phase 4 — Aujourd'hui V1
La vue V1 affiche les cinq décisions principales, leurs quatre scores, les relations, l'explication et la validation requise. Une préférence locale permet de la choisir comme vue principale sans retirer la vue historique.

## Phase 5 — Action Engine contrôlé
Le workflow persistant est `pending → approved/rejected → completed`. Toutes les transitions sont authentifiées et auditées. `completed` signifie uniquement un handoff client : aucune réponse, publication, suppression ou modification de calendrier n'est exécutée automatiquement.

## Phase 6 — Bascule progressive
La préférence `sigma_intelligence_v1_primary` active la V1 par défaut pour l'utilisateur. L'ancienne intelligence reste disponible pendant la période de comparaison et de non-régression.

## Phase 7 — Nettoyage sûr
Les modules historiques ne sont pas supprimés dans ce lot. Ils sont maintenus comme couche de compatibilité jusqu'à validation en production. Les nouvelles fonctions sont isolées sous `functions/src/intelligence/`; les nouvelles données sont isolées sous `users/{uid}`.

## Déploiement
1. Déployer règles et index Firestore.
2. Déployer les Functions.
3. Déployer le hosting.
4. Vérifier l'authentification, la synchronisation d'un signal, puis un cycle demande/rejet et un cycle demande/approbation/exécution.
