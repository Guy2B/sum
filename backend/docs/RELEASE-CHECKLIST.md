# Recette de publication — Σ Life OS 1.5.1

## Avant GitHub

- Exécuter `npm run check`.
- Ouvrir le projet avec `npm run serve`, jamais uniquement depuis le ZIP.
- Actualiser avec `Ctrl + F5` afin d'éliminer un ancien cache PWA.
- Vérifier que `.env` et les secrets OAuth ne sont pas présents.

## Identité et éditions

- Le logo affiche `Σ Life OS` et la signature `by Al.G.B.r.`.
- Student, Solo & Micro, Creator, Life et Nomad utilisent cinq accents distincts.
- Le mode propriétaire affiche les cinq éditions et permet de charger chaque démo.

## Santé

- Ouvrir Santé.
- Cliquer successivement sur Apple Health, Health Connect, Samsung Health et Huawei Health.
- Vérifier l'ouverture du dialogue.
- Simuler la connexion puis importer les mesures de démonstration.
- Vérifier les cartes Readiness, Sleep, Steps et Recovery ainsi que le graphique.

## Σ Guidance

- Charger une démo Solo & Micro.
- Ajouter un message important, une dépense, un projet, une mesure santé et une ressource d'apprentissage.
- Demander : `Guide-moi à partir de toute ma situation`.
- La réponse doit citer plusieurs domaines, proposer trois actions et indiquer les signaux utilisés.
- Tester ensuite une question Mail, Santé/charge et Apprentissage.
- Sur Chrome compatible, activer l'option IA locale ; sur les autres navigateurs, vérifier le retour automatique au moteur guidé.

## Mail Hub

- Sans backend, les quatre fournisseurs doivent ouvrir une connexion de démonstration explicite.
- Vérifier les compteurs non lus/importants et la transformation d'un message en tâche.
- Avec backend, tester Gmail et Outlook en OAuth de test, puis Yahoo et GMX avec des comptes de test et mots de passe d'application.

## Paiement et données

- Tester le checkout local mensuel puis annuel.
- Vérifier qu'aucune offre à vie n'apparaît.
- Exporter/importer une sauvegarde JSON.
- Vérifier que l'interface parle uniquement de sauvegarde sécurisée, sans exposer la technologie interne.
