# Sprints 675 à 689 — Inscription, profils de vie et accompagnements

## Nouveau parcours

Après l’authentification d’un nouveau compte, Sigma propose :

- les profils de vie pertinents ;
- les accompagnements actifs ;
- des suggestions initiales fondées sur le contexte déjà disponible ;
- la possibilité de remettre la configuration à plus tard.

Les sélections sont ensuite affichées dans **Essentiel / Mon contexte** sous une forme réduite.

## Synchronisation Git et Firebase

Chaque patch à partir de cette vague contient un synchroniseur de release.

Après installation :

```powershell
& "C:\Dev\sum\tools\SYNC-SIGMA-RELEASE-689.ps1" `
  -Target "C:\Dev\sum" `
  -CommitGit `
  -PushGit `
  -DeployFirebase
```

Les actions Git et Firebase ne sont pas lancées silencieusement par défaut. Elles exigent les options explicites afin d’éviter un déploiement ou un push accidentel.

Le script :

- exécute les tests de la vague ;
- vérifie le marqueur de release 689 ;
- ajoute et commit les changements ;
- pousse la branche Git active ;
- déploie Firebase Hosting ;
- crée `SIGMA-RELEASE-689-STATUS.json`.
