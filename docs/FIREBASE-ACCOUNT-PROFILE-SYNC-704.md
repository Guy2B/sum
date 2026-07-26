# Sprints 690 à 704 — Synchronisation Firebase des comptes et profils

Cette vague transforme les choix d’inscription en données persistées par utilisateur.

## Flux couvert

1. L’utilisateur s’authentifie.
2. Un document `users/{uid}` est créé ou mis à jour.
3. Les profils de vie et accompagnements sont enregistrés dans :
   `users/{uid}/profileState/active`
4. Au prochain appareil, Sigma récupère les choix Firebase.
5. Un résolveur compare les versions locale et distante.
6. Les modifications futures sont synchronisées automatiquement.

## Règles Firestore

Le patch contient :

- `firebase/firestore.rules.release-704`
- `firebase/firestore.indexes.release-704.json`

Avant déploiement, vérifiez que votre `firebase.json` référence le bon fichier de règles. Ne remplacez pas vos règles existantes sans comparaison.

## Synchronisation Git et Firebase

```powershell
& "C:\Dev\sum\tools\SYNC-SIGMA-RELEASE-704.ps1" `
  -Target "C:\Dev\sum" `
  -CommitGit `
  -PushGit `
  -DeployFirebase
```

Pour déployer aussi les règles Firestore après les avoir intégrées :

```powershell
& "C:\Dev\sum\tools\SYNC-SIGMA-RELEASE-704.ps1" `
  -Target "C:\Dev\sum" `
  -DeployFirestoreRules
```
