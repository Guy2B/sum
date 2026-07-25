# Sigma Sprints 21 à 25 — Plateforme d’éditions et commercialisation

Ces sprints transforment les éditions Sigma en compositions vérifiables du noyau commun, distinctes des offres commerciales.

## Sprint 21 — Module Registry

Registre canonique des modules, capacités, dépendances, domaines de confidentialité et états de cycle de vie. La résolution des dépendances est déterministe et bloque les modules inconnus, désactivés ou cycliques.

## Sprint 22 — Edition Engine

Une édition décrit un positionnement et une composition de modules partagés. Elle ne contient pas de logique métier dupliquée. Le moteur valide les modules au moment de l’enregistrement et matérialise une édition avec extensions ou désactivations contrôlées.

## Sprint 23 — Feature Flag Engine

Activation progressive des capacités avec règles contextuelles et dérogations par utilisateur, workspace, édition ou plan. Les décisions renvoient toujours une raison explicite.

## Sprint 24 — License Catalog

Catalogue commercial séparant prix, devise, période de facturation, modules inclus, quotas et métadonnées commerciales. La comparaison de plans expose les modules et limites modifiés.

## Sprint 25 — Entitlement Engine

Point de décision central entre édition, plan, modules additionnels, désactivations et feature flags. Le résultat explicite les modules autorisés/refusés, les limites et les capacités actives.

## Principe directeur

- Une **édition** répond à « pour quel usage et quel public ? ».
- Un **plan commercial** répond à « à quel prix et avec quelles limites ? ».
- Un **entitlement** répond à « que cette installation a-t-elle réellement le droit d’utiliser maintenant ? ».
- Tous les modules restent des capacités du noyau commun et ne deviennent pas des applications isolées.
