# Local intelligence strategy — V1.6.1

Σ uses a layered system:

1. **Guided engine** — deterministic rules, calculations and verified workspace data. Always available.
2. **Semantic understanding** — an optional multilingual Transformers.js embedding model improves intent routing. The model is downloaded and cached by the browser on first activation.
3. **Conversational rewrite** — Chrome's on-device Prompt API can rewrite the verified answer more naturally when supported.

Neither optional layer replaces deterministic calculations. If a model is unavailable, offline, too large for the device or fails to load, Σ continues with the guided engine.

The AI settings dialog makes downloads and device requirements explicit. No external AI API key or per-request billing is required for these local modes.
