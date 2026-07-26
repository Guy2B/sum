# Configuration Google Calendar réelle

Cette vague contient le client Google Calendar complet côté navigateur, mais Google exige vos propres identifiants.

Dans Google Cloud Console :

1. Créez ou sélectionnez un projet.
2. Activez **Google Calendar API**.
3. Configurez l’écran de consentement OAuth.
4. Créez un identifiant **OAuth 2.0 Client ID – Web application**.
5. Ajoutez les origines JavaScript autorisées :
   - `http://127.0.0.1:5000`
   - `http://localhost:5000`
   - votre domaine Firebase Hosting, par exemple `https://project-sum-b961a.web.app`
6. Créez une clé API et limitez-la à Google Calendar API et à vos domaines.
7. Dans Sigma, ouvrez la carte **Google Calendar réel**, puis **Configurer**.
8. Collez le Client ID et la clé API.
9. Cliquez **Connecter Google**.

Les jetons d’accès restent en mémoire de la page et ne sont pas écrits dans `localStorage`. La configuration publique du client est locale au navigateur.
