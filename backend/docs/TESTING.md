# Recette de test — SUM V1.3 Final

## 1. Démarrage

1. Extraire le ZIP dans un nouveau dossier.
2. Lancer `START-SUM.bat`.
3. Ouvrir `http://localhost:8080`.
4. Faire `Ctrl + F5` si une ancienne PWA SUM a déjà été utilisée.

## 2. Onboarding

Vérifier que cinq cartes apparaissent : Student, Solo, Creator, Life et Nomad.

Pour chaque édition :

- la carte peut être sélectionnée ;
- le nom, la promesse et l’icône sont visibles ;
- le formulaire accepte un nom, une langue et une devise ;
- l’édition choisie apparaît après validation.

## 3. Dashboard

Vérifier :

- la carte d’édition et ses quatre modèles ;
- quatre KPIs contextualisés ;
- aucun titre ou micro-label ne déborde ;
- les vues Aujourd’hui, Semaine et Mois ;
- les cartes priorité, essentiels, habitudes, énergie et focus Σ ;
- les raccourcis adaptés à l’édition ;
- les transitions et le responsive.

## 4. Changement d’édition

1. Ouvrir `Compte`.
2. Choisir une autre édition.
3. Enregistrer.
4. Vérifier immédiatement le dashboard, la navigation, les modèles et le Coach.
5. Répéter pour les cinq éditions.

## 5. Mode propriétaire

1. Ouvrir `Compte`.
2. Saisir `SUM-OWNER-PREVIEW`.
3. Vérifier le badge ADMIN.
4. Cliquer sur `Charger la démo de cette édition`.
5. Vérifier tâches, projet, finances, bilans, journal, apprentissage, objectifs, habitudes et événements.
6. Changer d’édition et recharger sa démo.

## 6. Σ Coach

Pour chaque édition :

- vérifier les trois suggestions dédiées ;
- envoyer une suggestion ;
- vérifier l’indicateur de réflexion ;
- vérifier une réponse et une question de suivi ;
- vérifier le badge de l’édition ;
- utiliser `Nouvelle conversation`.

## 7. Free / Pro

Free : langue principale + anglais, cinq demandes Σ par jour, limites prévues et stockage local.

Pro/Admin : quatre langues, modules Premium, vues Semaine/Mois, Coach illimité et sync.

## 8. Paiement

En local :

- ouvrir la fenêtre Pro ;
- choisir Mensuel et Annuel ;
- vérifier la simulation de checkout ;
- simuler un abonnement réussi ;
- vérifier l’activation de SUM Pro.

En production : ne tester qu’après avoir ajouté les deux liens de checkout dans `config.js`.

## 9. Sauvegarde

- exporter JSON ;
- créer une nouvelle donnée ;
- effacer l’espace ;
- importer le JSON ;
- vérifier la restauration et l’édition choisie.
