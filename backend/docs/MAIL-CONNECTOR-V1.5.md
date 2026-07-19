# Connecting Gmail, Outlook, Yahoo Mail and GMX

1. Start the web app on `http://localhost:8080`.
2. Configure and start `backend/mail-connector` on port 8787.
3. Put `mailApiBaseUrl: 'http://localhost:8787'` in `config.js`.
4. Create OAuth applications for Google and Microsoft and copy their credentials into the backend `.env`.
5. Gmail and Outlook use provider sign-in pages.
6. Yahoo and GMX use app passwords submitted directly to the encrypted backend.

No normal Yahoo or GMX password should ever be requested.
