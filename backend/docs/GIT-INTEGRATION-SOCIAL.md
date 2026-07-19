# Integrate Σ Social into the existing GitHub repository

## Safest method

1. In GitHub, create a branch named `social-hub-v1.6` from `main`.
2. Download `Sigma-Social-Hub-V1.6-Patch.zip`.
3. Extract the ZIP on your computer.
4. Upload the extracted files to the repository root, preserving every folder path.
5. Accept replacement of existing files.
6. Commit with the message:

```text
Add Sigma Social Hub V1.6
```

7. Open **Actions** and confirm that the validation and Pages deployment are green.
8. Test:

```text
https://YOUR-GITHUB-USER.github.io/YOUR-REPOSITORY/app.html#social
```

## Immediate demo test

Keep this setting empty in `config.js`:

```js
socialApiBaseUrl: '',
```

Instagram, Facebook and YouTube then load explicit local demo interactions. The demo can create tasks, reminders and Dashboard counters without external developer accounts.

## Real connector later

Deploy `backend/social-connector`, then set its public HTTPS URL in `config.js`.

Do not upload `.env`, OAuth secrets, access tokens or the `.data` directory to GitHub.
