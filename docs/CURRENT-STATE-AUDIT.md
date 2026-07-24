# Audit de l’état actuel — Sigma 15.0.0

## Périmètre et méthode

Audit statique et exécution locale réalisés sur une reconstruction du dépôt courant : archive Sprints 1–5 + payload Sprints 6–15. Le dépôt Git et les secrets de production ne figuraient pas dans l’archive. L’audit ne prouve donc pas le fonctionnement des fournisseurs externes ni d’un déploiement Firebase réel.

Commande exécutée :

```text
npm run verify
```

Résultat : audit de structure réussi, vérification syntaxique réussie, **56 tests réussis, 0 échec**.

## Architecture réellement présente

- Application web statique : `index.html`, `app.html`, `app.js`, scripts de modules chargés directement.
- Firebase : configuration, règles Firestore/Storage, Cloud Functions.
- Connecteurs locaux séparés : Mail, Calendar, Social et passerelle IA locale.
- Mobile : projet Capacitor Android/iOS et ponts santé natifs.
- Intelligence : Decision Engine, Entity Engine, signaux, mémoire et projection Today.
- Plateforme Sprints 6–15 : identité, collaboration, graph persistant, recherche, orchestration, audit, sécurité, registre de connecteurs, mémoire, agent sous approbation et readiness.

## Capacités prouvées par les tests

- Publication d’événements immuables et historique.
- Création de workspace et contrôle élémentaire des membres.
- Provenance et timeline des knowledge records.
- Planification déterministe limitée par une capacité.
- Profils d’identité versionnés.
- Invitation autorisée puis acceptée.
- Graphe persistant dans un adaptateur injecté et recherche de voisins.
- Recherche accent-insensible et isolée par workspace.
- Replanification après résultats.
- Chaîne d’audit vérifiable et blocage d’une action non sûre.
- Isolation des défaillances de fournisseurs.
- Mémoire formée après observations répétées.
- Actions externes maintenues sous approbation et produites en brouillon.
- Readiness bloquant les portes de release absentes.
- Comportement différencié des éditions Student et Solo, avec registre extensible.

## Capacités présentes mais non prouvées de bout en bout

- Écrans historiques : tâches, projets, finance, santé, journal, learning, planner, mail, social, dashboard.
- Connecteurs Gmail, Outlook, IMAP, Google/Microsoft Calendar et réseaux sociaux.
- Synchronisation Firebase et Cloud Functions.
- Applications mobiles Android/iOS.
- Persistance réelle des nouveaux services Sprints 6–15 dans Firestore.
- Application des nouvelles politiques de sécurité sur toutes les actions serveur.
- Activation des nouveaux services dans l’interface utilisateur principale.

## Éditions et offre commerciale

Le fichier `modules/decision-engine/editions.js` contient des profils intégrés, notamment Student, Solo, Creator et Life, avec boosts, pénalités et préférences. Les tests prouvent que l’édition influence la priorisation et qu’un profil futur peut être enregistré sans modifier le moteur.

Ce qui manque :

- manifeste canonique de chaque édition ;
- registre central des modules et dépendances ;
- droits/quotas par plan commercial ;
- validation d’entitlement côté serveur ;
- catalogue, prix, essais, abonnements et facturation ;
- migrations lors d’un changement d’offre ;
- mesure d’usage commerciale ;
- branding et configuration par client.

## Dette et risques techniques

1. De nombreux fichiers `*.before-*`, scripts APPLY/ROLLBACK et artefacts historiques restent à la racine et dans les modules.
2. Deux générations coexistent : modules historiques orientés UI et nouveaux services de domaine testés mais peu branchés.
3. Plusieurs stockages coexistent : `localStorage`, JSON locaux de connecteurs et Firestore.
4. Les nouveaux modèles n’utilisent pas encore un contrat canonique unique.
5. Les tests sont principalement unitaires ; peu de tests Firebase, navigateur, mobile ou fournisseur.
6. Les connecteurs locaux conservent potentiellement états et jetons sur disque ; leur chiffrement et cycle de vie doivent être vérifiés.
7. L’audit de structure interdit certains fichiers, mais ne remplace pas une détection de secrets dans l’historique Git.
8. Les règles spécifiques aux mineurs, à la santé et à l’emploi ne sont pas implémentées.

## Conclusion

Sigma 15.0.0 possède un noyau technique crédible et testé, mais reste une **alpha de plateforme**. Le prochain travail doit être l’unification du modèle commun, du temps, des preuves, de la confidentialité et des éditions avant d’ajouter de nouveaux domaines isolés.
