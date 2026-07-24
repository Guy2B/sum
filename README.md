# Correctif YouTube Guard

Copier les deux fichiers à la racine de `C:\Dev\sum`, puis lancer :

```cmd
APPLY-YOUTUBE-GUARD-FIX.cmd
```

Le script :

- sauvegarde `modules/decision-engine/engine.js` ;
- ajoute une détection dure des signaux `youtube_subscription` ;
- retourne `ignore` avant classification et scoring ;
- exécute `tests\intelligence\decision-engine-v6.test.js`.

Restauration manuelle :

```powershell
Copy-Item modules\decision-engine\engine.js.before-youtube-guard-fix modules\decision-engine\engine.js -Force
```
