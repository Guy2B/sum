'use strict';
(() => {
  function initAiSettings(ctx) {
    const dialog = document.getElementById('ai-settings-dialog');
    if (!dialog) return { render() {} };
    const openButton = document.getElementById('coach-ai-toggle');
    const semanticButton = document.getElementById('ai-semantic-toggle');
    const generativeButton = document.getElementById('ai-generative-toggle');
    const semanticStatus = document.getElementById('ai-semantic-status');
    const generativeStatus = document.getElementById('ai-generative-status');
    const progress = document.getElementById('ai-model-progress');

    async function render() {
      const state = ctx.getState();
      const semanticAvailable = await window.SUM_LOCAL_AI?.semanticAvailability();
      const nativeGenerative = await window.SUM_LOCAL_AI?.availability(ctx.language());
      const gatewayGenerative = await window.SUM_LOCAL_AI?.gatewayAvailability?.();
      const generativeAvailable = ['available', 'downloadable'].includes(nativeGenerative) ? nativeGenerative : gatewayGenerative;
      semanticButton.dataset.active = state.settings.semanticAiEnabled ? 'true' : 'false';
      generativeButton.dataset.active = state.settings.localAiEnabled ? 'true' : 'false';
      semanticButton.textContent = state.settings.semanticAiEnabled ? ctx.t('aiSettings.disable') : ctx.t('aiSettings.enable');
      generativeButton.textContent = state.settings.localAiEnabled ? ctx.t('aiSettings.disable') : ctx.t('aiSettings.enable');
      semanticStatus.textContent = state.settings.semanticAiEnabled ? ctx.t('aiSettings.ready') : semanticAvailable === 'downloadable' ? ctx.t('aiSettings.downloadable') : ctx.t('aiSettings.unavailable');
      generativeStatus.textContent = state.settings.localAiEnabled ? ctx.t('aiSettings.ready') : ['available', 'downloadable'].includes(generativeAvailable) ? ctx.t('aiSettings.available') : ctx.t('aiSettings.unavailable');
      const header = document.getElementById('coach-ai-status');
      if (header) {
        if (state.settings.localAiEnabled && state.settings.semanticAiEnabled) header.textContent = ctx.t('aiSettings.combined');
        else if (state.settings.localAiEnabled) header.textContent = ctx.t('aiSettings.generativeActive');
        else if (state.settings.semanticAiEnabled) header.textContent = ctx.t('aiSettings.semanticActive');
        else header.textContent = ctx.t('coach.guidedEngine');
      }
    }

    function setProgress(value, label) {
      progress.hidden = false;
      progress.querySelector('span').style.width = `${Math.max(0, Math.min(100, value))}%`;
      progress.querySelector('small').textContent = label || `${value}%`;
    }

    openButton?.addEventListener('click', (event) => { event.preventDefault(); event.stopImmediatePropagation(); dialog.showModal(); render(); }, true);
    document.getElementById('ai-settings-close')?.addEventListener('click', () => dialog.close());

    semanticButton.addEventListener('click', async () => {
      const enabled = Boolean(ctx.getState().settings.semanticAiEnabled);
      if (enabled) {
        window.SUM_LOCAL_AI?.destroySemantic();
        ctx.updateState((state) => { state.settings.semanticAiEnabled = false; });
        progress.hidden = true;
        return;
      }
      semanticButton.disabled = true;
      setProgress(3, ctx.t('aiSettings.preparingSemantic'));
      const prepared = await window.SUM_LOCAL_AI?.prepareSemantic(ctx.language(), (value) => setProgress(value, `${ctx.t('aiSettings.preparingSemantic')} ${value}%`));
      semanticButton.disabled = false;
      if (prepared?.ok) {
        ctx.updateState((state) => { state.settings.semanticAiEnabled = true; });
        setProgress(100, ctx.t('aiSettings.ready'));
      } else {
        progress.hidden = true;
        ctx.toast(ctx.t('aiSettings.unavailable'), 'error');
      }
      render();
    });

    generativeButton.addEventListener('click', async () => {
      const enabled = Boolean(ctx.getState().settings.localAiEnabled);
      if (enabled) {
        window.SUM_LOCAL_AI?.destroy();
        ctx.updateState((state) => { state.settings.localAiEnabled = false; });
        progress.hidden = true;
        return;
      }
      generativeButton.disabled = true;
      setProgress(3, ctx.t('aiSettings.preparingGenerative'));
      let prepared = await window.SUM_LOCAL_AI?.prepare(ctx.language(), (value) => setProgress(value, `${ctx.t('aiSettings.preparingGenerative')} ${value}%`));
      if (!prepared?.ok && await window.SUM_LOCAL_AI?.gatewayAvailability?.() === 'available') prepared = { ok: true, state: 'gateway' };
      generativeButton.disabled = false;
      if (prepared?.ok) {
        ctx.updateState((state) => { state.settings.localAiEnabled = true; });
        setProgress(100, ctx.t('aiSettings.ready'));
      } else {
        progress.hidden = true;
        ctx.toast(ctx.t('aiSettings.unavailable'), 'error');
      }
      render();
    });

    ctx.subscribe(render);
    document.addEventListener('languagechange', render);
    render();
    return { render };
  }

  window.SUM_MODULES = window.SUM_MODULES || {};
  window.SUM_MODULES.initAiSettings = initAiSettings;
})();
