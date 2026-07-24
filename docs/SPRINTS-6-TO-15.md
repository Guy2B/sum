# Sigma Life OS — Sprints 6 à 15

Cette livraison prolonge la fondation validée des Sprints -1 à 5 sans reconstruire le dépôt.

| Sprint | Capacité livrée | Garde-fou principal |
|---|---|---|
| 6 | Profils d'identité versionnés | validation stricte des statuts et identifiants |
| 7 | Invitations collaboratives | permission `member:manage`, expiration et jeton unique |
| 8 | Knowledge Graph persistant | nœuds/relations idempotents via clés canoniques |
| 9 | Index contextuel | recherche déterministe, normalisée et isolée par workspace |
| 10 | Planification adaptative | capacité bornée et replanification à partir des résultats |
| 11 | Audit et politique de sécurité | chaîne de hash et approbation des actions risquées |
| 12 | Registre de connecteurs | capacités déclarées et isolation des pannes fournisseur |
| 13 | Mémoire longue durée | croyances formées uniquement après observations répétées |
| 14 | Agent avec approbation | aucune écriture externe sans validation explicite |
| 15 | Readiness Release Candidate | portes tests, audit, secrets, couverture et migrations |

## Architecture

Les modules sont indépendants, injectables et testables sans réseau. Ils utilisent CommonJS afin de rester compatibles avec le runtime Node actuel et le chargement existant du dépôt.

## Validation

```powershell
npm run verify
```

La commande exécute l'audit de structure, la vérification syntaxique et l'ensemble des tests historiques et nouveaux.
