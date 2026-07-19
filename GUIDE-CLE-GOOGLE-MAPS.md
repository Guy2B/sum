# Ajouter la clé Google Maps à Sigma V4.7 / V4.8

1. Ouvrez Google Cloud Console et sélectionnez le même projet que Firebase/Google OAuth.
2. Vérifiez qu'un compte de facturation est associé au projet.
3. Dans **API et services > Bibliothèque**, activez :
   - Maps JavaScript API
   - Places API
   - Directions API
4. Ouvrez **API et services > Identifiants** puis **Créer des identifiants > Clé API**.
5. Ouvrez immédiatement la nouvelle clé et appliquez les restrictions suivantes :
   - Restriction d'application : **Sites Web (référents HTTP)**
   - Référents autorisés :
     - `https://guy2b.github.io/sum/*`
     - `http://localhost:*/*` uniquement pour les essais locaux
   - Restrictions d'API : limitez la clé à **Maps JavaScript API**, **Places API** et **Directions API**.
6. Dans `google-cloud-config.js`, remplacez :

```javascript
mapsApiKey: 'REPLACE_WITH_RESTRICTED_GOOGLE_MAPS_API_KEY'
```

par :

```javascript
mapsApiKey: 'AIza...votre-cle...'
```

7. Publiez le fichier, attendez GitHub Pages, puis ouvrez `app.html?v=4700` ou `app.html?v=4800` et faites Ctrl+Shift+R.

## Sécurité

Une clé Maps utilisée par JavaScript est visible dans le navigateur : ce n'est pas un secret. Sa sécurité repose donc sur les restrictions de référents HTTP et d'API. Ne réutilisez pas cette clé pour un serveur.
