'use strict';
(() => {
  let session = null;
  let sessionLanguage = '';

  function supportedLanguage(language) {
    return ['en', 'fr', 'de', 'es'].includes(language) ? language : 'en';
  }

  async function availability(language = 'en') {
    if (!window.SUM_CONFIG?.allowLocalAiOnDevice || window.SUM_CONFIG?.localAiMode === 'off') return 'disabled';
    if (!globalThis.LanguageModel?.availability) return 'unavailable';
    try {
      return await globalThis.LanguageModel.availability({
        expectedInputs: [{ type: 'text', languages: [supportedLanguage(language)] }],
        expectedOutputs: [{ type: 'text', languages: [supportedLanguage(language)] }]
      });
    } catch {
      return 'unavailable';
    }
  }

  async function prepare(language = 'en', onProgress) {
    const lang = supportedLanguage(language);
    const state = await availability(lang);
    if (state === 'unavailable' || state === 'disabled') return { ok: false, state };
    if (session && sessionLanguage === lang) return { ok: true, state: 'available' };
    try {
      session?.destroy?.();
      session = await globalThis.LanguageModel.create({
        expectedInputs: [{ type: 'text', languages: [lang] }],
        expectedOutputs: [{ type: 'text', languages: [lang] }],
        initialPrompts: [{ role: 'system', content: 'You are Σ, a cautious life and work decision coach. Rewrite only from the supplied verified facts. Never invent data. Do not diagnose, provide legal advice, or claim certainty. Keep the answer practical, structured and concise.' }],
        monitor(monitor) {
          monitor.addEventListener('downloadprogress', (event) => onProgress?.(Math.round(event.loaded * 100)));
        }
      });
      sessionLanguage = lang;
      return { ok: true, state: 'available' };
    } catch (error) {
      session = null;
      return { ok: false, state: 'error', error };
    }
  }

  async function enhance({ prompt, deterministicText, contextSummary, language = 'en' }) {
    if (!session || sessionLanguage !== supportedLanguage(language)) return deterministicText;
    const request = [
      'User question:', prompt,
      '',
      'Verified workspace context:', contextSummary,
      '',
      'Deterministic answer to preserve:', deterministicText,
      '',
      'Rewrite this answer in the user language. Preserve every number and fact, explicitly mark uncertainty, connect the domains when useful, and end with one concrete follow-up question. Do not add facts.'
    ].join('\n');
    try {
      const output = await session.prompt(request);
      return String(output || '').trim() || deterministicText;
    } catch {
      return deterministicText;
    }
  }

  function destroy() {
    session?.destroy?.();
    session = null;
    sessionLanguage = '';
  }

  window.SUM_LOCAL_AI = { availability, prepare, enhance, destroy };
})();
