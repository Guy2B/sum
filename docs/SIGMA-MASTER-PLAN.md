# Sigma Master Plan

**Status:** référentiel directeur — version 1.0  
**Base auditée:** dépôt Sigma 15.0.0 reconstruit à partir de l’archive Sprints 1–5 et du patch Sprints 6–15, puis validé avec `npm run verify`.

## Mission

Sigma doit devenir un système personnel et familial capable de suivre la chaîne suivante :

```text
Observer → Comprendre → Relier → Mémoriser → Évaluer
         → Recommander → Planifier → Accompagner → Mesurer
```

Le produit doit rester un système unique, modulaire et explicable. Chaque module spécialisé renforce le noyau commun au lieu de devenir une application isolée.

## Principes non négociables

1. Architecture commune et contrats de données partagés.
2. Provenance et preuves conservées pour toute conclusion.
3. Décisions explicables et niveau de confiance visible.
4. Contrôle humain avant toute action externe sensible.
5. Séparation stricte des profils, workspaces et domaines sensibles.
6. Mémoire temporelle révisable, exportable et supprimable.
7. Fonctionnalités activables selon l’édition, la licence et les permissions.
8. Aucun pourcentage d’avancement sans mesure issue de données réelles.
9. Les modules santé, enfants et emploi appliquent des règles renforcées.
10. Une capacité n’est « Fonctionnelle » que si elle est testée, persistante, intégrée et utilisable.

## Six piliers du produit

### 1. Organisation et exécution
Calendrier, agenda, tâches, réunions, routines, rappels, charge, priorités et plans quotidiens.

### 2. Projets et documents
Fichiers, notes, emails, dépôts Git, contrats, décisions, versions, échéances et livrables.

### 3. Santé et équilibre de vie
Activité, sommeil, récupération, habitudes, nutrition, rendez-vous et documents de santé, sans diagnostic automatique.

### 4. Connaissance et apprentissage
Compétences, formations, livres, articles, podcasts, vidéos, révision et progression fondée sur des preuves.

### 5. Famille et éducation
Profils séparés, scolarité, devoirs, résultats, intérêts, activités et recommandations pédagogiques non stigmatisantes.

### 6. Carrière et emploi
Expériences, compétences, orientation, offres, candidatures, entretiens, écarts et plans de progression.

## Moteurs transversaux

| Moteur | Responsabilité | État audit 15.0.0 |
|---|---|---|
| Signal Engine | Collecter et normaliser | Partiel |
| Entity Engine | Résoudre personnes, projets et concepts | Partiel |
| Knowledge Graph | Relier les informations | Partiel |
| Temporal Engine | Dates, séquences, retards, évolution | Absent comme moteur unifié |
| Decision Engine | Prioriser et recommander | Fonctionnel dans son périmètre testé |
| Goal Engine | Objectifs, capacité et jalons | Prototype testé |
| Progress Engine | Mesurer les progrès et la confiance | Absent |
| Recommendation Engine | Recommandations multi-domaines | Partiel et dispersé |
| Planning Engine | Transformer en plans | Prototype testé |
| Privacy Engine | Permissions, sensibilité, rétention | Partiel |
| Evidence Engine | Provenance et justification | Partiel |
| Edition Engine | Composer les produits et comportements | Partiel |
| Entitlement Engine | Licences, offres et droits commerciaux | Absent |

## Éditions et commercialisation différenciée

Sigma doit séparer clairement trois niveaux :

```text
Édition métier        : Student, Solo, Creator, Life, Business, Family…
Plan commercial       : Free, Starter, Pro, Business, Enterprise…
Modules/entitlements  : connecteurs, stockage, agents, collaboration, quotas…
```

Une édition décrit le comportement, les écrans et les modules pertinents. Un plan commercial décrit les limites, droits, quotas et conditions de vente. Les deux ne doivent pas être confondus.

Le dépôt contient déjà des profils de décision pour plusieurs éditions, mais pas encore de catalogue central, de registre de modules avec dépendances, de moteur de licence, de facturation ni de contrôle d’accès commercial côté serveur.

## Méthode de développement

Le développement suit une spirale : socle commun, cas d’usage réel, validation, extension multi-domaines, amélioration du socle, puis nouveau cas d’usage.

Chaque incrément doit fournir : contrat de données, persistance, permissions, tests, intégration UI, explication, métriques d’usage et documentation.

## Definition of Done

Une capacité est terminée seulement si elle :

- reçoit des données réelles ;
- conserve leur provenance ;
- possède des tests ;
- fonctionne après redémarrage ;
- explique ses résultats ;
- respecte les permissions ;
- peut être désactivée ;
- mesure son utilité ;
- expose son incertitude ;
- s’intègre au Knowledge Graph.
