# Feuille de route officielle

Cette feuille de route remplace une succession de versions isolées par des incréments vérifiables. Chaque lot doit produire un parcours vertical réel.

## Lot 0 — Stabilisation du référentiel

- Versionner les sept documents d’audit.
- Supprimer ou archiver hors du chemin actif les artefacts `*.before-*` et anciens scripts APPLY/ROLLBACK.
- Ajouter CI avec `npm run verify`, détection de secrets et inventaire des licences.
- Établir une nomenclature stable des versions et migrations.

**Sortie vérifiable :** dépôt propre, CI verte, documentation liée au code.

## Lot 1 — Modèle commun et moteurs fondamentaux

- Canonical Domain Model et validation de schémas.
- Evidence Engine transversal.
- Temporal Engine.
- Privacy Engine et politiques par domaine.
- Migration progressive des records, graph, memory, goals et planning.

**Parcours de preuve :** un signal réel devient un objet canonique, garde sa provenance, ses dates et ses permissions après redémarrage.

## Lot 2 — Plateforme d’éditions et commercialisation

- Module Registry avec dépendances et compatibilités.
- Edition Manifest pour Student, Solo, Creator, Life, puis Family/Business.
- Feature flags et configuration des menus.
- Entitlement Engine côté serveur.
- Plans Free/Starter/Pro/Business/Enterprise configurables.
- Quotas, essais, upgrades/downgrades, métriques et hooks de facturation.

**Parcours de preuve :** deux comptes avec plans différents voient et exécutent uniquement leurs capacités autorisées, sans simple masquage client.

## Lot 3 — Temps, objectifs et progression

- Goal/Milestone v2.
- Progress Engine distinguant déclaré, mesuré et estimé.
- Bilans quotidiens et hebdomadaires.
- Confiance, tendances, obstacles et historique.

**Parcours de preuve :** objectif → preuves → progression expliquée → prochaine action.

## Lot 4 — Agenda et projets de bout en bout

- Calendar unifié réel.
- Tâches avec durée, contraintes et dépendances.
- Détection de conflits et capacité.
- Documents et emails reliés aux projets.
- Proposition de créneaux, approbation et brouillon calendrier.

**Parcours de preuve :** réunion reçue → préparation détectée → créneau proposé → approbation → audit.

## Lot 5 — Connaissance et apprentissage

- Skill model, assessments et preuves.
- Ressources, lecture/écoute, notes et révision espacée.
- Recommandations adaptées au niveau, à l’objectif et au temps.

**Parcours de preuve :** ressource consommée → preuve → progression de compétence → recommandation expliquée.

## Lot 6 — Domaines sensibles

Ordre recommandé : santé en lecture seule, famille/école, puis carrière/emploi. Chaque domaine obtient ses propres politiques, consentements, rétentions et tests de biais/sécurité.

## Lot 7 — Release de production

- Staging et migrations.
- Tests Firebase, connecteurs, navigateur, mobile et charge.
- Monitoring, alertes, sauvegarde/restauration.
- Bêta contrôlée par édition.
- Documentation opérateur, support et conformité.

## Priorité immédiate

Ne pas ajouter un nouveau domaine avant les Lots 0 à 2. La prochaine réalisation doit consolider le noyau commun **et** rendre les éditions commercialement gouvernables.
