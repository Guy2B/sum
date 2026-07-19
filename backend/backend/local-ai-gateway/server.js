import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();
const port = Number(process.env.PORT || 8989);
const origins = String(process.env.APP_ORIGINS || 'http://localhost:8080').split(',').map((value) => value.trim()).filter(Boolean);
const ollama = String(process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434').replace(/\/$/, '');
const model = process.env.OLLAMA_MODEL || 'qwen2.5:3b';
const maxChars = Math.max(2000, Number(process.env.MAX_CONTEXT_CHARS || 14000));

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin(origin, callback) { if (!origin || origins.includes(origin)) return callback(null, true); callback(new Error('Origin not allowed')); } }));
app.use(express.json({ limit: '256kb' }));

async function ollamaStatus() {
  try { const response = await fetch(`${ollama}/api/tags`); return { ok: response.ok, status: response.status }; }
  catch (error) { return { ok: false, error: error.message }; }
}

app.get('/health', async (_req, res) => {
  const status = await ollamaStatus();
  res.status(status.ok ? 200 : 503).json({ ok: status.ok, service: 'sigma-local-ai-gateway', model, ollama: status });
});

app.post('/api/ai/rewrite', async (req, res) => {
  const prompt = String(req.body?.prompt || '').slice(0, 4000);
  const deterministicText = String(req.body?.deterministicText || '').slice(0, 9000);
  const contextSummary = String(req.body?.contextSummary || '').slice(0, maxChars);
  const language = String(req.body?.language || 'en').slice(0, 5);
  if (!deterministicText) return res.status(400).json({ ok: false, error: 'deterministicText required' });
  const system = 'You are Σ, a cautious life and work decision coach. Use only the verified facts supplied. Never invent facts, numbers, diagnoses, legal conclusions or regulated financial advice. Preserve uncertainty and user control. Return plain text only.';
  const user = [`Language: ${language}`, `User question: ${prompt}`, 'Verified context:', contextSummary, 'Deterministic answer that must be preserved:', deterministicText, 'Rewrite naturally and concisely. Keep every number and factual claim unchanged. End with at most one concrete next action.'].join('\n\n');
  try {
    const response = await fetch(`${ollama}/api/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model, stream: false, options: { temperature: 0.2 }, messages: [{ role: 'system', content: system }, { role: 'user', content: user }] }) });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) return res.status(502).json({ ok: false, error: payload.error || `Ollama ${response.status}` });
    const text = String(payload.message?.content || '').trim();
    res.json({ ok: true, text: text || deterministicText, model });
  } catch (error) { res.status(503).json({ ok: false, error: error.message }); }
});

app.listen(port, () => console.log(`Sigma Local AI Gateway listening on ${port}; model=${model}`));
