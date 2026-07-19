# Upgrade the existing GitHub repository from V1.5.1 to V1.7

You do not need to install V1.6 or V1.6.1 first. The V1.7 upgrade archive contains the complete current source.

## Recommended procedure

1. Download and extract `Sigma-Life-OS-V1.7-GitHub-Upgrade-From-V1.5.1.zip`.
2. Keep a ZIP backup of the current repository.
3. In GitHub, use **Add file → Upload files**.
4. Upload the extracted contents to the repository root.
5. Replace existing application files and add the new folders.
6. Keep the currently working `.github/workflows/static.yml` or Pages workflow. The upgrade archive deliberately excludes `.github` to avoid replacing it.
7. Commit with `Upgrade Sigma Life OS to V1.7 admin beta`.
8. Wait for GitHub Pages deployment to turn green.
9. Refresh with Ctrl+F5 or clear the PWA cache.

## Admin access

V1.7 ships with `adminQaEnabled: true`. Open **Admin QA**, load a scenario and export the JSON test report. Do not publish sales links while this flag is true.

## Backends and mobile

GitHub Pages hosts only the static interface. Mail, direct social OAuth and the optional local-AI gateway are separate Node services. Apple Health and Samsung Health require the native mobile projects in `mobile/`.
