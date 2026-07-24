# Sigma — Livraison Sprints -1 à 5

## Sprint -1 — Audit et sécurisation

- dépôt unique conservé ;
- duplication `backend/` retirée de la livraison ;
- dépendances générées et fichiers parasites retirés ;
- audit automatique `npm run audit:repo` ;
- cartographie canonique dans `docs/architecture/REPOSITORY-CANONICAL.md`.

## Sprint 0 — Fondation

- bus d'événements local et testable : `modules/core/event-bus.js` ;
- pipeline unique `npm run verify` ;
- workflow GitHub Actions `quality.yml` ;
- tests Node unifiés, sans imposer une réécriture de l'application.

## Sprint 1 — Identity & Workspace

- modèle Workspace, adhésions, rôles et permissions ;
- dépôt mémoire remplaçable par Firestore ;
- service applicatif avec événements `workspace.created` et `workspace.member_added` ;
- contrôle d'autorisation explicite et tests.

La connexion utilisateur continue d'utiliser Firebase Auth. Le nouveau module ne remplace pas l'authentification existante : il fournit la couche métier multi-workspace.

## Sprint 2 — Knowledge Foundation

- records typés `observation`, `statement`, `evidence`, `context`, `provenance` ;
- confiance, temporalité, source et métadonnées ;
- timeline déterministe et liaison preuve-déclaration ;
- réutilisation de l'Entity Engine V8/V8.1 existant.

## Sprint 3 — Event & Audit Foundation

- enveloppe événementielle standardisée ;
- acteur, workspace, corrélation, date et version ;
- historique borné ;
- abonnements précis ou globaux.

Cette fondation permet de relier progressivement Workspace, Knowledge, Planning et Intelligence sans couplage direct.

## Sprint 4 — Goals & Planning

- modèle Goal minimal ;
- priorité, progression et échéance ;
- score déterministe et explicable ;
- plan limité par capacité.

Le moteur reste sans effet externe et ne modifie ni calendrier ni tâche automatiquement.

## Sprint 5 — Intelligence contrôlée

Les composants déjà présents ont été conservés et validés :

- Signal Store ;
- Relationship Engine ;
- Priority Engine V2 ;
- Today Engine V2 ;
- Memory Engine ;
- Action Engine V2 ;
- validation humaine avant action ;
- aucun effet externe automatique.

## Validation locale

```powershell
cd C:\Dev\sum
npm ci
npm run verify
```

## Intégration dans le Git existant

```powershell
cd C:\Dev\sum
git switch -c sigma/sprints-minus-1-to-5
git add -A
git commit -m "feat: consolidate Sigma sprints -1 to 5"
```

Après validation, fusionner cette branche dans la branche principale. Ne jamais copier un dossier `.git` depuis une archive.
