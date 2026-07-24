# Dépôt canonique Sigma

Le dépôt canonique reste `C:\Dev\sum` et son dossier `.git` existant. Cette livraison ne contient volontairement aucun nouveau dépôt Git.

## Répertoires actifs

- racine : application web statique et configuration Firebase ;
- `modules/` : modules navigateur et noyaux CommonJS testables ;
- `functions/` : Cloud Functions et services serveur ;
- `mobile/` : enveloppe Capacitor ;
- `tests/` : tests Node ;
- `docs/` : documentation produit et technique.

## Éléments retirés de la livraison

- `backend/`, copie imbriquée de la quasi-totalité du dépôt ;
- `functions/node_modules/`, dépendances générées ;
- fichiers parasites créés par une commande PowerShell incorrecte ;
- cache `.firebase/`.

Ces retraits ne touchent pas aux points d'entrée actifs à la racine.
