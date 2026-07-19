# Sigma Life OS V1.7.2 RC2 Online — mise en service réelle

Cette version contient les modules **Mail**, **Réseaux sociaux** et **Calendrier**, ainsi qu'un blueprint `render.yaml` pour les déployer comme services Node sécurisés. GitHub Pages ne peut servir que le frontend statique : les connecteurs doivent être hébergés séparément.

## 1. Déployer les connecteurs

Créer un Blueprint Render depuis ce dépôt et utiliser `render.yaml`. Trois services sont créés :

- `sigma-mail-connector`
- `sigma-social-connector`
- `sigma-calendar-connector`

## 2. Ajouter les identifiants des fournisseurs

Dans les variables secrètes Render, compléter les clés décrites dans :

- `backend/mail-connector/.env.example`
- `backend/social-connector/.env.example`
- `backend/calendar-connector/.env.example`

Les opérations réelles ne sont possibles qu'après création des applications OAuth chez Google, Microsoft, Meta, YouTube, X, LinkedIn ou TikTok et, selon le fournisseur, validation des permissions demandées.

## 3. Renseigner les URL publiques

Modifier `online-config.js` avec les trois URL Render réellement attribuées, puis pousser le fichier sur GitHub :

```js
window.SIGMA_ONLINE_CONFIG = Object.freeze({
  mailApiBaseUrl: 'https://sigma-mail-connector.onrender.com',
  socialApiBaseUrl: 'https://sigma-social-connector.onrender.com',
  calendarApiBaseUrl: 'https://sigma-calendar-connector.onrender.com',
  localAiGatewayUrl: '',
  appsScriptUrl: ''
});
```

## 4. Déclarer les URL de redirection OAuth

Chaque console fournisseur doit recevoir exactement les URL de callback du service déployé, par exemple :

- Gmail : `https://<mail-service>/api/mail/callback/gmail`
- Outlook mail : `https://<mail-service>/api/mail/callback/outlook`
- Meta : `https://<social-service>/api/social/callback/meta`
- YouTube : `https://<social-service>/api/social/callback/youtube`
- X : `https://<social-service>/api/social/callback/x`
- LinkedIn : `https://<social-service>/api/social/callback/linkedin`
- TikTok : `https://<social-service>/api/social/callback/tiktok`
- Google Calendar : `https://<calendar-service>/api/calendar/callback/google`
- Microsoft Calendar : `https://<calendar-service>/api/calendar/callback/microsoft`

## Limites honnêtes

Le code des connecteurs est installé et déployable. Aucun paquet ne peut contenir légalement ou sûrement les secrets de tes comptes. Certaines plateformes exigent une revue d'application, un compte professionnel ou un forfait API avant d'autoriser les messages, commentaires, publications ou données avancées.
