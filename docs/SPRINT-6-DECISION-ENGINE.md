# Sprint 6.0 — Sigma Decision Engine

## Objectif

Remplacer le score naïf de la page Aujourd’hui par un moteur de décision hybride,
déterministe, explicable et personnalisable uniquement à partir d’observations
réelles.

Le moteur ne déduit jamais des décisions à partir de l’âge, du sexe, de l’origine,
de la religion, de la nationalité ou d’un autre attribut démographique sensible.

## Pipeline

Sources → normalisation → faits → connaissance relationnelle → règles →
personnalisation observée → score → explication → validation humaine → action.

## Garanties

- Les promotions et newsletters sont fortement dépriorisées.
- Les clients, prospects actifs, échéances et réunions proches sont contextualisés.
- Toute recommandation contient une explication et les règles déclenchées.
- Une confiance faible impose une revue humaine.
- Aucune action externe n’est automatique.
- La personnalisation ne démarre qu’après au moins cinq résultats observés.
- Les décisions sont auditables avec la version du moteur, les facteurs et la formule.

## Installation

Copier le dossier `modules/decision-engine` et le test dans le dépôt.

Ajouter ces scripts dans `app.html`, dans cet ordre, avant `intelligence-v17.js` :

```html
<script src="./modules/decision-engine/utils.js"></script>
<script src="./modules/decision-engine/knowledge.js"></script>
<script src="./modules/decision-engine/behavior.js"></script>
<script src="./modules/decision-engine/facts.js"></script>
<script src="./modules/decision-engine/rules.js"></script>
<script src="./modules/decision-engine/scorer.js"></script>
<script src="./modules/decision-engine/explain.js"></script>
<script src="./modules/decision-engine/engine.js"></script>
<script src="./modules/decision-engine/browser-loader.js"></script>
```

## Appel depuis l’état actuel

```js
const result = window.SUM_DECISION_ENGINE_V6.decideLegacyState(state, {
  capacityMinutes: 180
});

console.log(result.today.items);
```

Chaque élément expose notamment :

```js
{
  action,
  score,
  priorityBand,
  confidence,
  requiresApproval,
  dimensions,
  classification,
  explanation,
  rules,
  audit
}
```

## Intégration Today Engine

Dans la page Aujourd’hui, remplacer progressivement l’appel à :

```js
window.SUM_INTELLIGENCE_V17.recommendations(state)
```

par :

```js
window.SUM_DECISION_ENGINE_V6
  .decideLegacyState(state, { capacityMinutes: 180 })
  .today.items
```

Ne pas supprimer immédiatement `SUM_INTELLIGENCE_V17`. Le garder comme secours
jusqu’à validation en production.

## Tests

Depuis la racine du dépôt :

```cmd
node --test tests\intelligence\decision-engine-v6.test.js
```

## Déploiement

Ce sprint est côté navigateur. Après intégration dans `app.html` :

```cmd
firebase deploy --only hosting
```

Puis versionner :

```cmd
git add modules/decision-engine tests/intelligence/decision-engine-v6.test.js docs/SPRINT-6-DECISION-ENGINE.md app.html
git commit -m "Add Sigma Decision Engine v6"
git push origin main
```
