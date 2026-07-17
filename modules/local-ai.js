'use strict';
(() => {
  let chromeSession = null;
  let chromeLanguage = '';
  let embeddingPipeline = null;
  let semanticLanguage = '';
  let intentVectors = null;

  const INTENT_EXAMPLES = {
    en: { general: 'organise my whole situation daily plan priorities overview', tasks: 'tasks priority overdue workload what should I do first', projects: 'project roadmap milestone risk blocked next step', finance: 'money budget income expense cash flow tax preparation', health: 'health energy sleep stress recovery habits smartwatch', learning: 'learning study book course manual revision strategy', journal: 'journal reflection emotions gratitude decision patterns', mail: 'email inbox reply important message client follow up', social: 'social network comment message mention content audience', context: 'my goals constraints availability preferences whole context' },
    fr: { general: 'organiser toute ma situation plan du jour priorités vue ensemble', tasks: 'tâches priorité retard charge que faire en premier', projects: 'projet feuille de route étape risque bloqué prochaine action', finance: 'argent budget revenus dépenses trésorerie préparation fiscale', health: 'santé énergie sommeil stress récupération habitudes montre', learning: 'apprentissage étudier livre cours manuel révision stratégie', journal: 'journal réflexion émotions gratitude décision tendances', mail: 'email messagerie réponse message important client relance', social: 'réseau social commentaire message mention contenu audience', context: 'mes objectifs contraintes disponibilité préférences contexte global' },
    de: { general: 'gesamte situation organisieren tagesplan prioritäten überblick', tasks: 'aufgaben priorität überfällig arbeitslast zuerst', projects: 'projekt roadmap meilenstein risiko blockiert nächster schritt', finance: 'geld budget einnahmen ausgaben cashflow steuer vorbereitung', health: 'gesundheit energie schlaf stress erholung gewohnheiten smartwatch', learning: 'lernen buch kurs handbuch wiederholung strategie', journal: 'journal reflexion emotionen dankbarkeit entscheidung muster', mail: 'email postfach antwort wichtige nachricht kunde nachfassen', social: 'soziales netzwerk kommentar nachricht erwähnung inhalt publikum', context: 'ziele einschränkungen verfügbarkeit präferenzen gesamtkontext' },
    es: { general: 'organizar toda mi situación plan diario prioridades resumen', tasks: 'tareas prioridad retraso carga qué hacer primero', projects: 'proyecto hoja de ruta hito riesgo bloqueado siguiente paso', finance: 'dinero presupuesto ingresos gastos flujo de caja impuestos', health: 'salud energía sueño estrés recuperación hábitos smartwatch', learning: 'aprendizaje estudiar libro curso manual repaso estrategia', journal: 'diario reflexión emociones gratitud decisión patrones', mail: 'correo bandeja responder mensaje importante cliente seguimiento', social: 'red social comentario mensaje mención contenido audiencia', context: 'objetivos límites disponibilidad preferencias contexto completo' }
  };

  function supportedLanguage(language) { return ['en', 'fr', 'de', 'es'].includes(language) ? language : 'en'; }
  function cosine(a, b) { let dot = 0; let aa = 0; let bb = 0; for (let i = 0; i < a.length; i += 1) { dot += a[i] * b[i]; aa += a[i] * a[i]; bb += b[i] * b[i]; } return dot / (Math.sqrt(aa) * Math.sqrt(bb) || 1); }

  async function chromeAvailability(language = 'en') {
    if (!window.SUM_CONFIG?.allowLocalAiOnDevice || window.SUM_CONFIG?.localAiMode === 'off') return 'disabled';
    if (!globalThis.LanguageModel?.availability) return 'unavailable';
    try {
      return await globalThis.LanguageModel.availability({ expectedInputs: [{ type: 'text', languages: [supportedLanguage(language)] }], expectedOutputs: [{ type: 'text', languages: [supportedLanguage(language)] }] });
    } catch { return 'unavailable'; }
  }

  async function prepareChrome(language = 'en', onProgress) {
    const lang = supportedLanguage(language);
    const state = await chromeAvailability(lang);
    if (state === 'unavailable' || state === 'disabled') return { ok: false, state };
    if (chromeSession && chromeLanguage === lang) return { ok: true, state: 'available' };
    try {
      chromeSession?.destroy?.();
      chromeSession = await globalThis.LanguageModel.create({
        expectedInputs: [{ type: 'text', languages: [lang] }], expectedOutputs: [{ type: 'text', languages: [lang] }],
        initialPrompts: [{ role: 'system', content: 'You are Σ, a cautious life and work decision coach. Rewrite only from supplied verified facts. Never invent data. Do not diagnose or provide legal, medical or regulated financial advice. Preserve numbers, uncertainty and user control.' }],
        monitor(monitor) { monitor.addEventListener('downloadprogress', (event) => onProgress?.(Math.round(event.loaded * 100))); }
      });
      chromeLanguage = lang;
      return { ok: true, state: 'available' };
    } catch (error) { chromeSession = null; return { ok: false, state: 'error', error }; }
  }

  async function semanticAvailability() {
    if (embeddingPipeline) return 'available';
    if (!window.SUM_CONFIG?.allowSemanticAiOnDevice) return 'disabled';
    return navigator.onLine ? 'downloadable' : 'unavailable';
  }

  async function prepareSemantic(language = 'en', onProgress) {
    const lang = supportedLanguage(language);
    if (embeddingPipeline && semanticLanguage === lang && intentVectors) return { ok: true, state: 'available' };
    if (!window.SUM_CONFIG?.allowSemanticAiOnDevice) return { ok: false, state: 'disabled' };
    try {
      onProgress?.(5);
      const { pipeline, env } = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1');
      env.allowLocalModels = false;
      embeddingPipeline = await pipeline('feature-extraction', 'Xenova/paraphrase-multilingual-MiniLM-L12-v2', {
        dtype: 'q8',
        device: navigator.gpu ? 'webgpu' : 'wasm',
        progress_callback(info) {
          if (typeof info?.progress === 'number') onProgress?.(Math.max(8, Math.min(90, Math.round(info.progress))));
        }
      });
      semanticLanguage = lang;
      intentVectors = {};
      const examples = INTENT_EXAMPLES[lang] || INTENT_EXAMPLES.en;
      const entries = Object.entries(examples);
      for (let index = 0; index < entries.length; index += 1) {
        const [key, text] = entries[index];
        const output = await embeddingPipeline(text, { pooling: 'mean', normalize: true });
        intentVectors[key] = Array.from(output.data || output.tolist?.()[0] || []);
        onProgress?.(90 + Math.round((index + 1) / entries.length * 10));
      }
      return { ok: true, state: 'available' };
    } catch (error) {
      embeddingPipeline = null; intentVectors = null;
      return { ok: false, state: 'error', error };
    }
  }

  async function classifyIntent(text, language = 'en') {
    if (!embeddingPipeline || !intentVectors || semanticLanguage !== supportedLanguage(language)) return { intent: '', confidence: 0 };
    try {
      const output = await embeddingPipeline(String(text || ''), { pooling: 'mean', normalize: true });
      const vector = Array.from(output.data || output.tolist?.()[0] || []);
      const ranked = Object.entries(intentVectors).map(([intent, target]) => ({ intent, confidence: cosine(vector, target) })).sort((a, b) => b.confidence - a.confidence);
      return ranked[0] || { intent: '', confidence: 0 };
    } catch { return { intent: '', confidence: 0 }; }
  }

  function gatewayBase() { return String(window.SUM_CONFIG?.localAiGatewayUrl || '').replace(/\/$/, ''); }

  async function gatewayAvailability() {
    const base = gatewayBase();
    if (!base) return 'unconfigured';
    try {
      const response = await fetch(`${base}/health`, { credentials: 'omit' });
      return response.ok ? 'available' : 'unavailable';
    } catch { return 'unavailable'; }
  }

  async function gatewayEnhance({ prompt, deterministicText, contextSummary, language }) {
    const base = gatewayBase();
    if (!base) return '';
    try {
      const response = await fetch(`${base}/api/ai/rewrite`, {
        method: 'POST', credentials: 'omit', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, deterministicText, contextSummary, language: supportedLanguage(language) })
      });
      if (!response.ok) return '';
      const result = await response.json();
      return String(result.text || '').trim();
    } catch { return ''; }
  }

  async function enhance({ prompt, deterministicText, contextSummary, language = 'en' }) {
    const lang = supportedLanguage(language);
    const request = ['User question:', prompt, '', 'Verified workspace context:', contextSummary, '', 'Deterministic answer to preserve:', deterministicText, '', 'Rewrite this answer in the user language. Preserve every number and fact, explicitly mark uncertainty, connect domains when useful, and end with one concrete follow-up question. Do not add facts.'].join('\n');
    if (chromeSession && chromeLanguage === lang) {
      try { const output = await chromeSession.prompt(request); if (String(output || '').trim()) return String(output).trim(); }
      catch { /* use the cross-browser gateway below */ }
    }
    const gateway = await gatewayEnhance({ prompt, deterministicText, contextSummary, language: lang });
    return gateway || deterministicText;
  }

  function destroyChrome() { chromeSession?.destroy?.(); chromeSession = null; chromeLanguage = ''; }
  function destroySemantic() { embeddingPipeline = null; intentVectors = null; semanticLanguage = ''; }

  window.SUM_LOCAL_AI = {
    availability: chromeAvailability,
    prepare: prepareChrome,
    enhance,
    destroy: destroyChrome,
    semanticAvailability,
    prepareSemantic,
    classifyIntent,
    gatewayAvailability,
    gatewayEnhance,
    destroySemantic
  };
})();
