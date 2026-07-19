'use strict';
(() => {
  const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  const DOMAIN_KEYS = ['mail', 'social', 'health', 'finance', 'journal', 'learning'];

  function initContext(ctx) {
    const panel = document.getElementById('panel-context');
    if (!panel) return { render() {} };
    const profileForm = document.getElementById('context-profile-form');
    const checkinForm = document.getElementById('context-checkin-form');
    const coverageRoot = document.getElementById('context-coverage-score');
    const coverageBar = document.getElementById('context-coverage-bar');
    const checklistRoot = document.getElementById('context-checklist');
    const sourceRoot = document.getElementById('context-source-grid');
    const checkinHistory = document.getElementById('context-checkin-history');
    const dashboardCopy = document.getElementById('dashboard-context-copy');
    const dashboardScore = document.getElementById('dashboard-context-score');

    function contextState() {
      const state = ctx.getState();
      return state.contextProfile || {};
    }

    function setField(name, value) {
      const field = profileForm?.elements?.[name];
      if (!field) return;
      if (field.type === 'checkbox') field.checked = Boolean(value);
      else field.value = value ?? '';
    }

    function completeness(state = ctx.getState()) {
      const profile = state.contextProfile || {};
      const checks = [
        Boolean(profile.primaryGoal?.trim()),
        Boolean(profile.successDefinition?.trim()),
        Number(profile.weeklyHours) > 0,
        Boolean(profile.energyPeak),
        Boolean(profile.currentPressure?.trim() || profile.constraints?.trim()),
        Array.isArray(profile.workDays) && profile.workDays.length > 0,
        Boolean(profile.coachingTone),
        Boolean(profile.coachingDepth),
        Boolean(state.contextCheckins?.length),
        Boolean(state.mailAccounts?.length || state.socialAccounts?.length || state.healthSources?.length || state.learningResources?.length)
      ];
      const score = Math.round(checks.filter(Boolean).length / checks.length * 100);
      return { score, checks };
    }

    function sourceData(state) {
      return [
        { key: 'mail', panel: 'mail', count: state.mailAccounts.length, detail: state.mailMessages.length },
        { key: 'social', panel: 'social', count: state.socialAccounts.length, detail: state.socialInteractions.filter((item) => !item.handled).length },
        { key: 'health', panel: 'health', count: state.healthSources.length, detail: state.health.length },
        { key: 'calendar', panel: 'planner', count: state.events.length ? 1 : 0, detail: state.events.length },
        { key: 'learning', panel: 'learning', count: state.learning.length, detail: state.learningResources.length },
        { key: 'documents', panel: 'sync', count: 0, detail: 0, planned: true }
      ];
    }

    function renderProfile() {
      if (!profileForm) return;
      const profile = contextState();
      ['primaryGoal', 'secondaryGoal', 'successDefinition', 'weeklyHours', 'focusHours', 'energyPeak', 'fixedCommitments', 'currentPressure', 'constraints', 'coachingTone', 'coachingDepth'].forEach((key) => setField(key, profile[key]));
      DAY_KEYS.forEach((day) => {
        const input = profileForm.querySelector(`[name="workDays"][value="${day}"]`);
        if (input) input.checked = (profile.workDays || []).includes(day);
      });
      DOMAIN_KEYS.forEach((domain) => {
        const input = profileForm.querySelector(`[name="domains"][value="${domain}"]`);
        if (input) input.checked = profile.includedDomains?.[domain] !== false;
      });
      setField('allowCrossAnalysis', profile.allowCrossAnalysis !== false);
    }

    function renderCoverage() {
      const state = ctx.getState();
      const result = completeness(state);
      if (coverageRoot) coverageRoot.textContent = `${result.score}%`;
      if (coverageBar) coverageBar.style.width = `${result.score}%`;
      if (dashboardScore) dashboardScore.textContent = `${result.score}%`;
      const items = [
        ['goal', result.checks[0]], ['success', result.checks[1]], ['availability', result.checks[2] && result.checks[5]],
        ['constraints', result.checks[4]], ['preferences', result.checks[6] && result.checks[7]], ['checkin', result.checks[8]], ['sources', result.checks[9]]
      ];
      if (checklistRoot) checklistRoot.innerHTML = items.map(([key, done]) => `<li class="${done ? 'done' : ''}"><span>${done ? '✓' : '○'}</span><span>${ctx.escape(ctx.t(`context.check.${key}`))}</span></li>`).join('');
      if (dashboardCopy) dashboardCopy.textContent = result.score >= 80 ? ctx.t('context.dashboardStrong') : result.score >= 50 ? ctx.t('context.dashboardMedium') : ctx.t('context.dashboardLow');
    }

    function renderSources() {
      const state = ctx.getState();
      if (!sourceRoot) return;
      sourceRoot.innerHTML = sourceData(state).map((source) => {
        const connected = source.count > 0;
        const status = source.planned ? ctx.t('context.planned') : connected ? ctx.t('context.connected') : ctx.t('context.notConnected');
        return `<button class="context-source-card ${connected ? 'connected' : ''}" type="button" data-panel="${source.panel}">
          <span class="context-source-icon">${ctx.escape(ctx.t(`context.sourceIcon.${source.key}`))}</span>
          <span><strong>${ctx.escape(ctx.t(`context.source.${source.key}`))}</strong><small>${ctx.escape(status)}${source.detail ? ` · ${source.detail}` : ''}</small></span>
          <b>${source.planned ? '…' : connected ? '✓' : '→'}</b>
        </button>`;
      }).join('');
    }

    function renderCheckins() {
      if (!checkinHistory) return;
      const entries = [...(ctx.getState().contextCheckins || [])].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))).slice(0, 6);
      checkinHistory.innerHTML = entries.length ? entries.map((entry) => `<article class="context-checkin-item"><div><strong>${ctx.formatDate(entry.date)}</strong><span>${ctx.escape(ctx.t('context.energyStress', { energy: entry.energy, stress: entry.stress }))}</span></div><p>${ctx.escape(entry.win || entry.blocker || entry.focus || '')}</p></article>`).join('') : `<div class="empty-state compact">${ctx.t('context.noCheckins')}</div>`;
    }

    function render() {
      renderProfile();
      renderCoverage();
      renderSources();
      renderCheckins();
    }

    profileForm?.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(profileForm);
      const includedDomains = {};
      DOMAIN_KEYS.forEach((domain) => { includedDomains[domain] = data.getAll('domains').includes(domain); });
      ctx.updateState((state) => {
        state.contextProfile = {
          ...state.contextProfile,
          primaryGoal: String(data.get('primaryGoal') || '').trim(),
          secondaryGoal: String(data.get('secondaryGoal') || '').trim(),
          successDefinition: String(data.get('successDefinition') || '').trim(),
          weeklyHours: Number(data.get('weeklyHours') || 0),
          focusHours: Number(data.get('focusHours') || 0),
          energyPeak: String(data.get('energyPeak') || 'morning'),
          workDays: data.getAll('workDays'),
          fixedCommitments: String(data.get('fixedCommitments') || '').trim(),
          currentPressure: String(data.get('currentPressure') || '').trim(),
          constraints: String(data.get('constraints') || '').trim(),
          coachingTone: String(data.get('coachingTone') || 'balanced'),
          coachingDepth: String(data.get('coachingDepth') || 'detailed'),
          allowCrossAnalysis: data.get('allowCrossAnalysis') === 'on',
          includedDomains,
          updatedAt: new Date().toISOString()
        };
      });
      ctx.toast(ctx.t('context.saved'));
    });

    checkinForm?.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(checkinForm);
      ctx.updateState((state) => {
        state.contextCheckins.unshift({
          id: ctx.uid(), date: ctx.today(), energy: Number(data.get('energy') || 5), stress: Number(data.get('stress') || 5),
          win: String(data.get('win') || '').trim(), blocker: String(data.get('blocker') || '').trim(), focus: String(data.get('focus') || '').trim(),
          createdAt: new Date().toISOString()
        });
      });
      checkinForm.reset();
      const energy = checkinForm.elements.energy; const stress = checkinForm.elements.stress;
      if (energy) energy.value = '7'; if (stress) stress.value = '4';
      ctx.toast(ctx.t('context.checkinSaved'));
    });

    document.getElementById('context-ask-coach')?.addEventListener('click', () => document.dispatchEvent(new CustomEvent('sum:coach-prompt', { detail: { text: ctx.t('context.coachPrompt') } })));
    document.getElementById('dashboard-context-open')?.addEventListener('click', () => ctx.navigate('context'));

    ctx.subscribe(render);
    document.addEventListener('languagechange', render);
    render();
    return { render, completeness };
  }

  window.SUM_MODULES = window.SUM_MODULES || {};
  window.SUM_MODULES.initContext = initContext;
})();
