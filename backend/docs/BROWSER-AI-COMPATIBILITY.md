# Browser and local AI compatibility

## Universal baseline

Every supported browser receives:

- deterministic ranking and calculations;
- explainable recommendations;
- local state and exports;
- optional semantic model through Transformers.js;
- WASM fallback when GPU acceleration is unavailable.

## Optional accelerators

- WebGPU is used only when available and stable.
- A browser-native language model is used only after availability detection and user activation.
- `backend/local-ai-gateway` offers optional self-hosted Ollama rewriting to Chrome, Edge, Safari and Firefox.

Σ never blocks core guidance because a model is unavailable. The generative layer receives a deterministic answer and verified context, and may only rewrite them.

## Supported families

- Chrome and Edge: deterministic + WASM; WebGPU/native generation when available.
- Safari on macOS/iOS: deterministic + WASM; WebGPU where supported; optional gateway.
- Firefox: deterministic + WASM; WebGPU where supported; optional gateway.
- Android WebView/Chrome: deterministic + WASM; native mobile inference can be added later.
- Internet Explorer: unsupported.
