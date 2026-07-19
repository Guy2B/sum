# Déploiement V2.5

## 1. Google Cloud
Activez : Gmail API, Google Calendar API, Google Drive API, YouTube Data API v3.

Dans `google-cloud-config.js` :
```js
oauthClientId: 'VOTRE_NOUVEAU_CLIENT_ID.apps.googleusercontent.com'
```
Ne placez jamais le secret client dans ce dépôt.

## 2. GitHub Pages
Publiez tous les fichiers à la racine du dépôt, puis vérifiez :
- `/firebase-config.js`
- `/google-cloud-config.js`
- `/platform-config.js`
- `/modules/google-workspace.js`

## 3. Tests
- Créer/ouvrir un compte Sigma.
- Connecter Gmail et importer les messages.
- Envoyer un e-mail de test via `SigmaGoogle.sendGmail(...)`.
- Importer le calendrier.
- Créer un événement via `SigmaGoogle.createCalendarEvent(...)`.
- Sauvegarder puis restaurer via Drive.

## 4. Publication publique OAuth
Les scopes Gmail peuvent être sensibles. Pour dépasser le mode test et ses limites, Google peut demander la validation de l’écran de consentement, du domaine et des politiques publiques.
