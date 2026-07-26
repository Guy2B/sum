# Installation complète

```powershell
Set-Location "C:\Dev"

Expand-Archive `
  "C:\Users\guybe\Downloads\Sigma_SUM_HOTFIX_Release_719_WINDOWS.zip" `
  -DestinationPath ".\Sigma-Hotfix-719" `
  -Force

& ".\Sigma-Hotfix-719\Sigma_SUM_HOTFIX_Release_719_WINDOWS\APPLY-SIGMA-HOTFIX-719.ps1" `
  -Target "C:\Dev\sum" `
  -CommitGit `
  -PushGit `
  -DeployFirestoreRules `
  -DeployHosting
```

Le script utilise le chemin de règles déclaré dans `firebase.json`.

## Vérification dans le navigateur

```javascript
SigmaRuntimeFirestoreHotfixAcceptanceV1.validate()
await SigmaRuntimeFirestoreHotfixV1.diagnostics()
await SigmaFirebaseProfileDiagnosticsV1.run()
```

Résultat attendu :

- release 719 ;
- aucune exception provenant de `path.split`;
- utilisateur Firebase authentifié ;
- aucune erreur `permission-denied`;
- données distantes lisibles.
