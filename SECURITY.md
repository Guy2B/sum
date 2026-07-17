# Security policy

Do not publish real OAuth secrets, app passwords, licence keys, customer exports, health readings, financial data, journal entries, or mailbox data in GitHub issues or commits.

Report a vulnerability privately to the support address configured in `config.js`. Include the affected version, reproduction steps, and a minimal example with all personal data removed.

The static frontend stores workspace data locally by default. OAuth tokens and IMAP application passwords belong only in the optional backend and must never be placed in browser code.
