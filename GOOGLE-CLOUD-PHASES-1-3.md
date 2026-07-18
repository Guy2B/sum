# Sigma Life OS V2.1 — Phases 1 à 3

## Déjà implémenté

- Firebase Authentication : e-mail/mot de passe et Google.
- Synchronisation Firestore du profil et de l'espace de travail utilisateur.
- Gmail : autorisation OAuth dans le navigateur et import des messages récents en lecture seule.
- Google Calendar : autorisation OAuth et import des événements à venir en lecture seule.
- Google Drive : sauvegarde/restauration privée dans `appDataFolder`.
- Gemini : réécriture facultative via un proxy Google Apps Script gratuit afin de ne pas exposer la clé API.

## Valeurs à compléter

### `firebase-config.js`
Remplacez uniquement `REPLACE_WITH_FIREBASE_WEB_API_KEY` par la clé Web Firebase déjà récupérée.

### `google-cloud-config.js`
Créez un identifiant OAuth 2.0 de type **Application Web** et renseignez `oauthClientId`.
Origines JavaScript autorisées :
- `https://guy2b.github.io`
- `http://localhost:8080`

Activez dans Google Cloud :
- Gmail API
- Google Calendar API
- Google Drive API

Ajoutez les portées de test OAuth :
- `gmail.readonly`
- `calendar.readonly`
- `drive.appdata`

Pour Gemini, suivez `backend/google-apps-script-gemini/README.md` puis renseignez `appsScriptAiProxyUrl`.

## Limites honnêtes de cette bêta 0 €

- Les jetons Google Workspace sont gardés uniquement en mémoire : une nouvelle autorisation peut être demandée après rechargement.
- Gmail et Calendar sont en lecture seule.
- Aucune synchronisation ne s'exécute lorsque le navigateur est fermé.
- Le proxy Apps Script et Gemini restent soumis à leurs quotas gratuits.
- Apple Health/Watch et Health Connect nécessitent toujours des applications natives.
