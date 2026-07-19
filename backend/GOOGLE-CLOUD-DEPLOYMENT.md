# Sigma Life OS V2.0 Beta — Google Cloud Edition

## Ce qui est fourni
Firebase Authentication, Firestore, Storage, règles de sécurité, index, Cloud Functions de bêta, configuration Hosting et client web Firebase.

## Création du projet
1. Créer un projet dans Firebase Console.
2. Ajouter une application Web et copier ses valeurs dans `firebase-config.js`.
3. Remplacer le projet dans `.firebaserc`.
4. Activer Authentication: Email/Password et Google.
5. Ajouter `guy2b.github.io` aux domaines autorisés Authentication.
6. Créer Firestore en mode production et activer Storage.

## Déploiement
```bash
npm install -g firebase-tools
firebase login
firebase use --add
cd functions && npm install && cd ..
firebase deploy --only firestore:rules,firestore:indexes,storage,functions
```

Le frontend peut rester sur GitHub Pages. Committer `firebase-config.js` est acceptable car la configuration Web Firebase est publique; la sécurité repose sur Auth, App Check et les règles. Ne jamais y placer une clé de compte de service.

## Tests réels disponibles après configuration
- inscription et connexion Email/Google;
- profil persistant Firestore;
- documents utilisateur protégés par règles;
- stockage privé sous `users/{uid}`;
- import santé authentifié via Cloud Function;
- activation Premium bêta pour le compte connecté;
- retours bêta persistants.

## Connecteurs Gmail, Calendar et réseaux
Ils nécessitent des fonctions OAuth dédiées et des secrets Google/Meta/Microsoft. Les anciens connecteurs RC2 restent présents comme référence, mais ne sont pas automatiquement actifs dans Firebase. Configurer d'abord Auth/Firestore, puis ajouter les secrets avec Secret Manager et déployer les fonctions OAuth.
