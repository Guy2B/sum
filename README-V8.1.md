# Sigma V8.1 — Graph Inspector + mémoire persistante

Cette édition corrige les caractères d'échappement invalides du patch précédent.

## Installation

1. Décompresser le ZIP à la racine de `C:\Dev\sum` en remplaçant les fichiers V8.1 précédents.
2. Lancer :

```cmd
APPLY-V8.1.cmd
```

Le script vérifie désormais la syntaxe de chaque fichier JavaScript avant d'exécuter les tests.

## Tests manuels

```cmd
node --check tests\entity-engine\v8.1-graph-inspector.test.js
node --test tests\entity-engine\v8.1-graph-inspector.test.js
node --test
```

## API navigateur

```js
window.SIGMA_ENTITY_ENGINE.version
window.SIGMA_ENTITY_ENGINE.restore()
window.SIGMA_ENTITY_ENGINE.mountInspector('#sigma-graph-inspector')
```

## Rollback

```cmd
ROLLBACK-V8.1.cmd
```
