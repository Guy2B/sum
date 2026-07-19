# Deploy Sigma Life OS V4.5 on GitHub Pages

1. Back up the current repository.
2. Replace repository files with the contents of this folder.
3. Preserve your real `firebase-config.js` and `google-cloud-config.js` values.
4. Commit and wait for the GitHub Pages workflow to complete.
5. Open `app.html?v=4500` and perform one hard refresh.
6. Verify Google sign-in, Gmail import, Calendar and Drive using the existing OAuth consent flow.

The V4.5 service worker removes old application caches during activation, which prevents older V3 interface files from remaining visible.
