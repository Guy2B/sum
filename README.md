# Sigma Life OS

Sigma est un Life Operating System web, mobile et cloud. Le dépôt canonique est le dossier Git existant `C:\Dev\sum`.

## Démarrage local

```bash
npm ci
npm run verify
npm run serve
```

Ouvrir ensuite `http://localhost:8080`.

## Validation

```bash
npm run audit:repo
npm run check
npm test
```

## Architecture

- `modules/` : application et moteurs métier ;
- `functions/` : Firebase Cloud Functions ;
- `mobile/` : Capacitor Android/iOS ;
- `tests/` : tests automatisés ;
- `docs/SPRINTS-MINUS-1-TO-5.md` : état de la livraison.

Les actions externes sensibles restent soumises à validation humaine et produisent des brouillons ou artefacts contrôlés.
