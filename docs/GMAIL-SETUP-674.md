# Configuration Gmail réelle — Release 674

Cette vague utilise Gmail API et Google Identity Services. Vous devez fournir vos propres identifiants Google Cloud.

1. Dans le même projet Google Cloud que Calendar, activez **Gmail API**.
2. Vérifiez l’écran de consentement OAuth.
3. Ajoutez les scopes nécessaires :
   - `gmail.readonly`
   - `gmail.modify`
   - `gmail.send`
4. Utilisez un OAuth Client ID de type **Web application**.
5. Autorisez :
   - `http://127.0.0.1:5000`
   - `http://localhost:5000`
   - votre domaine Firebase Hosting.
6. Limitez la clé API à Gmail API et à vos domaines.
7. Dans Sigma, ouvrez la carte **Gmail réel**, cliquez **Configurer**, puis saisissez :
   - OAuth Client ID
   - API Key
8. Cliquez **Connecter Gmail**.

Les jetons d’accès restent en mémoire de la page. Ils ne sont pas sauvegardés dans `localStorage`.

## Limite de cette vague

La synchronisation est déclenchée manuellement depuis le navigateur. Une synchronisation automatique en arrière-plan nécessitera un backend sécurisé, des jetons longue durée et des tâches planifiées.
