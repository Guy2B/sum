# Sprints 720 à 734 — Google Unified Session & Connector Recovery

## Comportement

- Firebase fournit l’identité du compte Google connecté.
- Sigma réutilise l’adresse du compte comme indice de connexion Google.
- Le premier onboarding propose Gmail, Calendar, Drive, Contacts et Tasks.
- Les scopes choisis sont regroupés dans une seule demande d’autorisation.
- Les connecteurs autorisés sont rechargés automatiquement lorsque le jeton est encore valide.
- Lorsque Google exige une interaction, les connecteurs restent visibles avec le statut `Autorisation requise`.
- Les modules absents restent visibles avec le statut `Indisponible`.
- Les réseaux non Google restent séparés.

## Limitation importante

Ce patch utilise le modèle OAuth navigateur. Il ne stocke pas de refresh token côté serveur. Google peut donc exiger une interaction lorsque le jeton expire ou lorsque la session ne peut pas être renouvelée silencieusement.

## Git et Firebase

```powershell
& "C:\Dev\sum\tools\SYNC-SIGMA-RELEASE-734.ps1" `
  -Target "C:\Dev\sum" `
  -CommitGit `
  -PushGit `
  -DeployFirebase
```
