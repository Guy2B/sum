# Carte d’architecture

## État observé

```text
Navigateurs / PWA / Capacitor
        │
        ├── Modules UI historiques
        │   Tasks, Projects, Finance, Health, Journal, Learning,
        │   Mail, Calendar, Social, Coach, Dashboard…
        │
        ├── Decision Engine + Entity Engine
        │
        ├── Services plateforme Sprints 6–15
        │   Identity, Collaboration, Knowledge, Search, Planning,
        │   Audit, Security, Memory, Agents, Release
        │
        ├── Firebase client
        │          │
        │          └── Cloud Functions / Firestore / Storage
        │
        └── Connecteurs locaux séparés
            Mail / Calendar / Social / Local AI
```

## Problème structurel principal

Les composants existent, mais les chemins d’exécution ne passent pas encore tous par les mêmes contrats. Les modules historiques peuvent utiliser leurs propres structures et `localStorage`, alors que les nouveaux services S6–S15 sont des bibliothèques testées et injectables.

## Architecture cible

```text
Sources et connecteurs
        ↓
Signal Engine + Source Registry
        ↓
Canonical Domain Model
        ↓
Entity + Evidence + Temporal + Privacy
        ↓
Knowledge Graph + Memory
        ↓
Goal + Progress + Decision + Recommendation
        ↓
Planning + Approval + Execution
        ↓
Audit + Outcome Measurement
        ↓
UI composée par Edition + Entitlements
```

## Contrat canonique minimal

Tous les objets partagent :

```text
id, type, ownerId, workspaceId, source,
createdAt, updatedAt, confidence, privacyLevel,
evidence[], relationships[], schemaVersion
```

Objets cibles : Person, Organization, Household, ChildProfile, Project, Goal, Milestone, Task, Event, Document, Signal, Decision, Skill, LearningResource, HealthMetric, JobOpportunity, Application, Assessment, ProgressRecord, Recommendation et Evidence.

## Frontières obligatoires

- Les connecteurs ne prennent pas de décisions.
- Le client ne valide jamais seul une permission ou un entitlement.
- La mémoire ne transforme pas une inférence en fait.
- Le Decision Engine ne réalise aucune action externe.
- L’Agent Engine exécute seulement après politique et approbation.
- Les éditions configurent le produit sans dupliquer les moteurs.
- Les plans commerciaux contrôlent les droits côté serveur.

## Cible éditions/modules

```text
Edition Manifest
  ├── modules requis et optionnels
  ├── navigation et écrans
  ├── profil de décision
  ├── politiques de confidentialité
  ├── recommandations autorisées
  └── compatibilité des plans

Commercial Plan
  ├── entitlements
  ├── quotas
  ├── collaboration
  ├── connecteurs
  ├── stockage/rétention
  ├── IA/agents
  └── support et SLA
```
