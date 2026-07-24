# Inventaire des sources de données

| Source | Composants repérés | Stockage/transport repéré | État audit | Données sensibles / risques |
|---|---|---|---|---|
| Gmail | mail connector, Google Workspace, Functions | OAuth/API + états locaux potentiels | Partiel | emails, contacts, jetons |
| Outlook/IMAP | mail connector | OAuth/IMAP + store local | Partiel | identifiants, emails, pièces jointes |
| Google Calendar | calendar connector | API + store local | Partiel | horaires, lieux, participants |
| Microsoft Calendar | calendar connector | Microsoft Graph + store local | Partiel | horaires, organisation, jetons |
| LinkedIn | social modules/connector | API ou simulation selon configuration | Partiel | profil, réseau, publications |
| YouTube | social modules/connector | API/signaux | Partiel | abonnements, intérêts, historique potentiel |
| X | social modules/connector | API | Partiel | posts, relations, jetons |
| TikTok | social modules/connector | API | Partiel | intérêts, contenus, jetons |
| Meta | social connector | fournisseur présent, activation à contrôler | Partiel | profils sociaux très sensibles |
| Firebase Auth | `firebase-cloud.js`, Functions | Firebase | Partiel | identité et sessions |
| Firestore | règles, Functions, modules cloud | collections utilisateur | Partiel | signaux, audit, mémoire, actions |
| Firebase Storage | règles et config | cloud | Partiel | documents potentiellement sensibles |
| Local browser | `app.js`, i18n et modules | `localStorage` | Fonctionnel techniquement | données non chiffrées sur appareil |
| Connecteurs locaux | stores Mail/Calendar/Social | fichiers/état local | Partiel | jetons et cache à auditer/chiffrer |
| Local AI | gateway + module UI | HTTP local | Partiel | prompts et contexte transmis au modèle |
| Git/dépôts | aucune ingestion canonique active identifiée | — | Absent | code, secrets, propriété intellectuelle |
| Fichiers cloud | modules Google/Microsoft généraux | capacités possibles non prouvées | Prototype | documents, contrats, métadonnées |
| Santé native | ponts Android/iOS/Samsung | APIs appareils | Prototype | données de santé à haute sensibilité |
| Journal | module historique | stockage client probable | Prototype | données intimes |
| Livres/podcasts | module learning générique | non identifié | Absent | préférences et progression |
| École/enfants | aucune source structurée | — | Absent | données de mineurs |
| Emploi/offres | aucune source structurée | — | Absent | CV, candidatures, discrimination potentielle |

## Actions requises avant extension

1. Créer un registre canonique des sources avec propriétaire, finalité, sensibilité, rétention, base légale/consentement, capacité d’export et suppression.
2. Interdire qu’un connecteur écrive directement dans un modèle spécifique ; tous passent par le Signal Engine et le modèle commun.
3. Chiffrer les secrets et jetons au repos ; aucun secret dans `localStorage` ou le dépôt.
4. Prévoir une option « ne pas mémoriser » par source, domaine et événement.
5. Documenter précisément quelles données sont nécessaires à chaque édition et plan commercial.
