# Matrice des capacités

## Règles d’évaluation

- **Fonctionnel** : testé et utilisable dans le dépôt audité.
- **Partiel** : présent mais incomplet ou non intégré de bout en bout.
- **Prototype** : service ou démonstration testée, sans intégration de production complète.
- **Absent** : aucune capacité cohérente identifiée.

| Capacité | État | Preuves principales | Lacune déterminante |
|---|---|---|---|
| Event Bus | Fonctionnel | `modules/core/event-bus.js`, test dédié | Pas encore adopté par tous les modules historiques |
| Workspace | Prototype | model/repository/service + tests | Persistance et permissions serveur à intégrer |
| Identity profiles | Prototype | service versionné + test | Auth Firebase et UI non reliées |
| Invitations | Prototype | service + test d’autorisation | Email, expiration persistante et serveur absents |
| Signal normalization | Partiel | client + Cloud Functions + tests intelligence | Contrat canonique multi-source incomplet |
| Entity resolution | Partiel | Entity Engine + tests | Couverture des entités et persistance unifiée |
| Knowledge Graph | Prototype | graph/memory/records + tests | Plusieurs implémentations et adaptateurs à fusionner |
| Temporal Engine | Absent | dates utilisées localement | Aucun moteur commun de temporalité |
| Decision Engine | Fonctionnel | moteur, règles, scoring, tests déterministes | Intégration multi-domaines et résultats réels à mesurer |
| Edition-aware decisions | Fonctionnel | profils intégrés + tests | Ne couvre pas modules, UI, licences ni entitlements |
| Goal Engine | Prototype | `goal-engine.js` + test | Jalons, preuves et persistance de production |
| Progress Engine | Absent | aucun moteur transversal | À concevoir |
| Adaptive planning | Prototype | planner S10 + test | Agenda réel et UI non intégrés |
| Context search | Prototype | index S9 + test | Pas d’index documentaire ou sémantique de production |
| Long-term memory | Prototype | mémoire S13 + test | Gouvernance, édition et oubli incomplets |
| Evidence/provenance | Partiel | records, provenance, explanations | Pas de service transversal canonique |
| Audit log | Prototype | chaîne vérifiable + test | Stockage durable, accès et export à intégrer |
| Policy engine | Prototype | règles S11 + test | Non appliqué partout côté serveur |
| Approval agent | Prototype | agent S14 + tests + actions Cloud | Connecteurs réels d’exécution non reliés |
| Unified connector registry | Prototype | registre + test d’isolation | Adaptateurs historiques non migrés |
| Mail connectors | Partiel | Gmail/Outlook/IMAP présents | Fonctionnement réel et sécurité OAuth non vérifiés |
| Calendar connectors | Partiel | Google/Microsoft présents | Planification exécutive et tests réels absents |
| Social connectors | Partiel | 5 fournisseurs présents | Fiabilité, conformité et activation à vérifier |
| Local AI gateway | Partiel | serveur et UI présents | Modèles, confidentialité et robustesse non vérifiés |
| Tasks/Projects UI | Partiel | modules historiques chargés | Modèle commun et flux vertical non testés |
| Finance | Prototype | module UI historique | Données réelles et règles métier non auditées |
| Health | Prototype | modules web/native | Flux réel, consentement et prudence médicale non prouvés |
| Journal | Prototype | module historique | Mémoire temporelle et confidentialité à intégrer |
| Learning | Prototype | module historique | Skill model et progression fondée sur preuves absents |
| Family/Education | Absent | aucun module cohérent | À concevoir avec règles mineurs |
| Career/Employment | Absent | aucun module cohérent | À concevoir |
| Mobile | Partiel | projets Android/iOS Capacitor | Builds et tests appareils non exécutés |
| Release readiness | Prototype | service S15 + test | CI/CD, staging et preuves opérationnelles à brancher |
| Module registry | Absent | registre connecteurs seulement | Catalogue canonique des modules requis |
| Licence/entitlement | Absent | aucune validation centralisée | Indispensable à la commercialisation différenciée |
| Billing/subscription | Absent | docs historiques seulement | Fournisseur et cycle commercial à concevoir |
