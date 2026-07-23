# Sigma Life OS — Sprints 5.1 à 5.3

## Sprint 5.1 — SigmaSignal Store

La synchronisation Cloud Functions valide et minimise les signaux avant toute écriture. Les identifiants Firestore sont des empreintes SHA-256 stables, ce qui rend les imports idempotents même lorsque l’identifiant source contient des caractères réservés. Les scores, tailles de texte, listes, dates, domaines, catégories et actions sont bornés côté serveur. Le client ne peut toujours pas écrire directement dans les collections Intelligence.

Collections utilisées :

- `users/{uid}/signals/{hash}`
- `users/{uid}/auditEvents/{eventId}`

Le document conserve `originalId` afin de pouvoir retrouver l’identifiant métier sans dépendre du nom du document Firestore.

## Sprint 5.2 — Relationship Engine

Le moteur applique l’ordre suivant : identifiants explicites, adresse e-mail, domaine, nom exact, puis similarité textuelle. Chaque relation contient une confiance, un type de correspondance et des preuves. Les relations sont persistées lors de la synchronisation :

- `users/{uid}/entities/{entityKey}`
- `users/{uid}/signalRelations/{relationKey}`

Le module `RelationshipRepository` permet de lire les entités et les relations d’un signal. `RelationshipService.buildGraph()` produit un graphe en mémoire destiné aux futures vues Contact, Entreprise, Projet et Objectif.

## Sprint 5.3 — Priority Engine V2

Le score reste déterministe et explicable. Les dimensions sont calculées séparément : importance, urgence, impact et confiance. La formule par défaut est :

```text
importance × 0,35 + urgence × 0,30 + impact × 0,25 + confiance × 0,10
```

Chaque dimension expose ses facteurs et leur contribution. Le résultat contient également une bande `low`, `medium`, `high` ou `critical`, la formule appliquée et la version du moteur. Les relations sont résolues avant le calcul de priorité afin qu’un lien confirmé avec un contact, une entreprise, un projet ou un objectif puisse contribuer de façon transparente au classement.

## Limites volontaires

- aucune IA générative obligatoire ;
- aucun envoi automatique ;
- aucune modification automatique du calendrier ;
- aucune suppression externe ;
- aucune donnée LinkedIn indisponible n’est simulée ;
- aucune migration destructive du document `workspaces/{uid}`.

## Déploiement

```bash
npm run audit:repo
npm run test:intelligence
firebase deploy --only functions,firestore:rules,firestore:indexes,hosting
```

Tester d’abord avec les émulateurs Firebase ou un projet de préproduction.
