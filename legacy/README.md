# Legacy and optional services

This directory contains components preserved from the former duplicated `backend/` tree.
They are **not part of the GitHub Pages or Firebase Hosting application** and must not be
assumed to run in production.

- `connectors/`: standalone historical mail, calendar, and social connector services.
- `integrations/`: Google Apps Script experiments.
- `services/`: optional local AI gateway.

The active application remains at the repository root. New Intelligence Engine work must
not import files from this directory. Promote a legacy component only through an explicit,
tested migration.
