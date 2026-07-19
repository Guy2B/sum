# Configuration des paiements — SUM 1.3.0

SUM prévoit deux abonnements récurrents uniquement :

- **SUM Pro mensuel** — 8,90 € / mois par défaut ;
- **SUM Pro annuel** — 69 € / an par défaut.

Les montants et les liens restent modifiables dans `config.js`.

## Pourquoi les paiements réels ne sont pas préremplis

Un vrai checkout doit être créé dans le compte marchand du propriétaire. Il dépend de son identité, de son pays, de ses coordonnées bancaires, de sa fiscalité et de la validation de la plateforme. Ces informations ne doivent pas être intégrées ou inventées dans le code livré.

SUM accepte uniquement les **URL publiques de checkout**. Ne placez jamais de mot de passe, clé secrète PayPal, secret de webhook ou identifiant bancaire dans `config.js`.

## Test immédiat sans paiement

Sur `localhost` ou `file://` :

1. ouvrez **Compte & formule** ;
2. activez le mode propriétaire avec `SUM-OWNER-PREVIEW` ;
3. cliquez sur **Tester le checkout** ;
4. choisissez Mensuel ou Annuel ;
5. cliquez sur **Simuler un abonnement réussi**.

Aucun argent n'est débité. Cette simulation vérifie l'ouverture de l'offre, le choix de la période, l'activation Pro et le retour au produit.

Depuis la landing page locale, les boutons Mensuel et Annuel dirigent également vers ce parcours de test lorsqu'aucune URL réelle n'est encore renseignée.

## Option recommandée : checkout hébergé avec licences

### Étape 1 — Créer les deux variantes

Dans la plateforme de paiement :

1. créer le produit **SUM Pro** ;
2. créer une variante mensuelle récurrente ;
3. créer une variante annuelle récurrente ;
4. activer la génération de licences si la plateforme la prend en charge ;
5. commencer en mode test.

### Étape 2 — Copier les liens publics

Ouvrir `config.js` et renseigner :

```js
paymentProvider: 'lemon-squeezy',
paymentMode: 'test',
monthlyCheckoutUrl: 'COLLER_ICI_LE_LIEN_MENSUEL_TEST',
annualCheckoutUrl: 'COLLER_ICI_LE_LIEN_ANNUEL_TEST',
```

Recharger SUM avec `Ctrl + F5`. La fenêtre Pro doit afficher **Checkout test prêt**.

### Étape 3 — Passer en production

Après une transaction de test réussie :

```js
paymentMode: 'live',
monthlyCheckoutUrl: 'COLLER_ICI_LE_LIEN_MENSUEL_LIVE',
annualCheckoutUrl: 'COLLER_ICI_LE_LIEN_ANNUEL_LIVE',
```

Effectuer ensuite un achat réel à faible montant ou avec un coupon de test contrôlé, puis vérifier l'e-mail, la licence, l'activation et l'annulation.

## Utiliser PayPal directement

Des liens ou boutons PayPal peuvent être collés dans les deux champs :

```js
paymentProvider: 'paypal',
monthlyCheckoutUrl: 'LIEN_ABONNEMENT_PAYPAL_MENSUEL',
annualCheckoutUrl: 'LIEN_ABONNEMENT_PAYPAL_ANNUEL',
```

Le paiement fonctionnera, mais l'activation automatique de la licence nécessite ensuite un webhook ou une intervention manuelle. Pour une activité secondaire à faible intervention, une plateforme de checkout avec licences intégrées reste plus simple.

## Vérification finale

```text
[ ] Les deux boutons ouvrent deux offres différentes
[ ] Le prix et la période sont corrects
[ ] Le checkout est en mode test avant la publication
[ ] Un paiement test réussit
[ ] Une licence est émise ou créée
[ ] La licence active SUM Pro
[ ] Une annulation/expiration retire correctement Pro
[ ] Aucun secret n'est présent dans les fichiers publics
[ ] Les pages légales et l'adresse de support sont complétées
```
