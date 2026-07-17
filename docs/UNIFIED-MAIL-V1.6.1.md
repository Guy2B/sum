# Unified Mail Setup — V1.6.1

## Customer journey

1. Enter one email address.
2. Σ detects Gmail, Outlook/Microsoft, Yahoo or GMX.
3. Gmail and Outlook redirect to the official OAuth page when the backend is configured.
4. Yahoo and GMX use guided provider-generated app passwords; the main password is never requested.
5. All connected addresses appear in one compact list and one attention queue.

Custom professional domains display a small host choice because an address alone cannot reliably reveal whether Google Workspace, Microsoft 365 or another service hosts the mailbox.

## Demo mode

When `mailApiBaseUrl` is empty, the same journey creates clearly labelled local demo data. No mailbox is accessed.

## Real connections

Configure `backend/mail-connector` and set only its public URL in `config.js`. OAuth client secrets and encrypted mailbox credentials remain on the backend.
