# Meta integration disabled

Facebook Pages and Instagram Business are intentionally disabled because official Meta developer API access is not currently available for this project.

The UI does not offer Meta connections, Meta data is excluded from active social counts and feeds, and Meta Cloud Functions are no longer exported. Existing historical Firestore data is not deleted.

To reactivate later, restore the Meta implementation from Git history, restore `modules/meta-v491.js`, add the script tag back to `app.html`, re-enable the provider configuration, configure Meta secrets/parameters, and deploy the restored functions.
