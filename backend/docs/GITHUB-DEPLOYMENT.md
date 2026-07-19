# Publication GitHub — guide pas à pas

## 1. Créer le dépôt

Créez un dépôt GitHub **privé** nommé `sigma-life-os`. N'ajoutez pas de README automatique : le projet en contient déjà un.

## 2. Envoyer le projet

Dans le dossier extrait :

```bash
git init
git branch -M main
git add .
git commit -m "Release Sigma Life OS 1.5.1"
git remote add origin https://github.com/VOTRE-COMPTE/sigma-life-os.git
git push -u origin main
```

## 3. Vérifier GitHub Actions

L'onglet **Actions** doit afficher :

- `Validate Sigma Life OS` : syntaxe, IDs, traductions et contrôles de régression ;
- `Deploy static frontend to GitHub Pages` : construction et publication du frontend statique.

## 4. Activer GitHub Pages

Dans **Settings → Pages**, choisissez **GitHub Actions** comme source. Le workflow `pages.yml` déploie uniquement le frontend ; il n'expose pas le backend mail.

## 5. Backend Mail Hub

GitHub Pages ne peut pas exécuter Node.js. Déployez `backend/mail-connector` séparément sur un hébergeur Node sécurisé. Ajoutez les secrets dans les variables d'environnement de cet hébergeur, puis renseignez l'URL publique dans `config.js` :

```js
mailApiBaseUrl: 'https://VOTRE-BACKEND-MAIL.example.com'
```

## 6. Secrets

Ne commitez jamais :

- `.env` ;
- secrets OAuth Google ou Microsoft ;
- mots de passe d'application Yahoo ou GMX ;
- licences réelles ;
- exports client ;
- données de santé, finances, journal ou messagerie.

Le `.gitignore` fourni couvre les fichiers secrets usuels, mais vérifiez toujours `git status` avant chaque push.
