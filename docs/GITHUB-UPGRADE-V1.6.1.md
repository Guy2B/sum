# Upgrade an existing GitHub repository to V1.6.1

1. Download the V1.6.1 upgrade patch.
2. Extract it locally.
3. In the GitHub repository, choose **Add file → Upload files**.
4. Upload the contents of the patch directory, preserving `modules/`, `backend/`, `docs/` and `scripts/` paths.
5. Do not upload `.env`, OAuth secrets, provider passwords or backend data files.
6. Commit directly to `main` with the message `Upgrade Sigma Life OS to V1.6.1`.
7. Wait for the existing GitHub Pages workflow to pass.
8. Open the deployment and perform `Ctrl + F5` to replace the previous service-worker cache.
9. Run the owner preview and test Context, Mail, Social, Coach and all four languages.

The patch intentionally does not replace a working GitHub Pages workflow.
