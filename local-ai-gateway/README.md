# Σ Local AI Gateway

Passerelle facultative et auto-hébergée vers Ollama. Elle apporte une reformulation générative sans facturation par requête à Chrome, Edge, Safari et Firefox.

1. Installer Ollama et télécharger un petit modèle multilingue, par exemple `ollama pull qwen2.5:3b`.
2. Copier `.env.example` vers `.env` et régler `APP_ORIGINS`.
3. Installer les dépendances : `npm install`.
4. Démarrer : `npm start`.
5. Renseigner `localAiGatewayUrl` dans `config.js`.

Le moteur déterministe et la compréhension sémantique du navigateur restent fonctionnels lorsque cette passerelle est absente.
