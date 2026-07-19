'use strict';
(() => {
  let healthChart;
  const PROVIDERS = {
    apple: { name: 'Apple Health', platform: 'iOS / watchOS', bridge: 'apple' },
    'health-connect': { name: 'Health Connect', platform: 'Android', bridge: 'healthConnect' },
    samsung: { name: 'Samsung Health', platform: 'Android / Galaxy', bridge: 'samsung' },
    huawei: { name: 'Huawei Health', platform: 'Android / HarmonyOS', bridge: 'huawei' }
  };

  const detailsFor = (provider) => PROVIDERS[provider] || PROVIDERS.apple;
  const numberOrZero = (value) => Number(value || 0);
  const average = (entries, key) => entries.length ? entries.reduce((sum, item) => sum + numberOrZero(item[key]), 0) / entries.length : 0;

  function initHealth(ctx) {
    const form = document.getElementById('health-form');
    const list = document.getElementById('health-list');
    const summary = document.getElementById('health-summary');
    const deviceGrid = document.getElementById('health-device-grid');
    const dialog = document.getElementById('health-connect-dialog');
    const closeButton = document.getElementById('health-connect-close');
    const demoButton = document.getElementById('health-connect-demo');
    const importButton = document.getElementById('health-import-demo');
    const title = document.getElementById('health-connect-title');
    const copy = document.getElementById('health-connect-copy');
    const statusRoot = document.getElementById('health-connect-status');
    const moodNames = { 1: 'health.moodLow', 2: 'health.moodOkay', 3: 'health.moodGood', 4: 'health.moodGreat' };
    let selectedProvider = 'apple';

    function renderChart(entries) {
      const canvas = document.getElementById('health-chart');
      if (!window.Chart || !canvas) return;
      const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date)).slice(-14);
      healthChart?.destroy();
      healthChart = new window.Chart(canvas, {
        type: 'line',
        data: { labels: sorted.map((item) => ctx.shortDate(item.date)), datasets: [
          { label: ctx.t('health.sleep'), data: sorted.map((item) => item.sleep), tension: .35, borderColor: '#5370ff', backgroundColor: 'rgba(83,112,255,.12)', fill: true },
          { label: ctx.t('health.energy'), data: sorted.map((item) => item.energy), tension: .35, borderColor: '#18a999', backgroundColor: 'rgba(24,169,153,.08)' },
          { label: ctx.t('health.stress'), data: sorted.map((item) => item.stress || null), tension: .35, borderColor: '#e8793e', backgroundColor: 'rgba(232,121,62,.06)' }
        ] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { boxWidth: 10, usePointStyle: true } } }, scales: { x: { grid: { display: false } }, y: { min: 0, grid: { color: 'rgba(127,127,127,.12)' } } } }
      });
    }

    function summaryCard(label, value, detail = '') {
      return `<article class="health-summary-card"><span>${ctx.escape(label)}</span><strong>${ctx.escape(value)}</strong><small>${ctx.escape(detail)}</small></article>`;
    }

    function renderSummary(entries) {
      const recent = [...entries].sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 7);
      if (!recent.length) {
        summary.innerHTML = summaryCard(ctx.t('health.readiness'), '—', ctx.t('health.noRecentData')) +
          summaryCard(ctx.t('health.sleep'), '—', ctx.t('health.lastSevenDays')) +
          summaryCard(ctx.t('health.steps'), '—', ctx.t('health.lastSevenDays')) +
          summaryCard(ctx.t('health.recovery'), '—', ctx.t('health.noRecentData'));
        return;
      }
      const sleep = average(recent, 'sleep');
      const energy = average(recent, 'energy');
      const stress = average(recent, 'stress');
      const steps = Math.round(average(recent, 'steps'));
      const hrv = average(recent.filter((item) => item.hrv), 'hrv');
      const readiness = Math.max(0, Math.min(100, Math.round((sleep / 8) * 38 + (energy / 10) * 37 + ((10 - stress) / 10) * 25)));
      summary.innerHTML = [
        summaryCard(ctx.t('health.readiness'), `${readiness}%`, ctx.t('health.calculatedFromSignals')),
        summaryCard(ctx.t('health.sleep'), `${sleep.toFixed(1)} h`, ctx.t('health.lastSevenDays')),
        summaryCard(ctx.t('health.steps'), steps.toLocaleString(), ctx.t('health.dailyAverage')),
        summaryCard(ctx.t('health.recovery'), hrv ? `${Math.round(hrv)} ms` : `${Math.round(energy * 10)}%`, hrv ? ctx.t('health.hrv') : ctx.t('health.energyBased'))
      ].join('');
    }

    function sourceFor(provider) {
      return ctx.getState().healthSources.find((item) => item.provider === provider);
    }

    function renderSources() {
      Object.keys(PROVIDERS).forEach((provider) => {
        const source = sourceFor(provider);
        const button = deviceGrid?.querySelector(`[data-health-provider="${provider}"]`);
        const status = deviceGrid?.querySelector(`[data-health-status="${provider}"]`);
        if (!button || !status) return;
        button.classList.toggle('connected', source?.status === 'connected');
        status.textContent = source?.status === 'connected'
          ? ctx.t('health.connectedDemo')
          : source?.status === 'planned' ? ctx.t('health.connectionPlanned') : ctx.t('health.notConnected');
      });
    }

    function render() {
      const entries = ctx.getState().health;
      list.innerHTML = entries.length ? entries.map((item) => `<article class="list-item">
        <div class="health-orb">${['😕','😐','🙂','😄'][item.mood - 1] || '•'}</div>
        <div class="list-item-main"><div class="list-item-title">${ctx.formatDate(item.date)}</div><div class="meta-row"><span>${ctx.t('health.sleep')}: ${item.sleep}</span><span>${ctx.t('health.mood')}: ${ctx.t(moodNames[item.mood])}</span><span>${ctx.t('health.energy')}: ${item.energy}/10</span><span>${ctx.t('health.stress')}: ${item.stress || '—'}/10</span><span>${ctx.t('health.hydration')}: ${item.hydration || '—'}L</span><span>${ctx.t('health.steps')}: ${item.steps || 0}</span>${item.hrv ? `<span>${ctx.t('health.hrv')}: ${item.hrv} ms</span>` : ''}${item.bloodOxygen ? `<span>${ctx.t('health.bloodOxygen')}: ${item.bloodOxygen}%</span>` : ''}</div></div>
        <button class="icon-button danger" type="button" data-health-delete="${item.id}" aria-label="${ctx.t('common.delete')}">×</button>
      </article>`).join('') : `<div class="empty-state">${ctx.t('health.empty')}</div>`;
      renderSummary(entries);
      renderSources();
      renderChart(entries);
    }

    function providerCopy(provider) {
      const details = PROVIDERS[provider];
      return ctx.t('health.providerCopy', { provider: details.name, platform: details.platform });
    }

    function openProvider(provider) {
      selectedProvider = provider;
      const details = PROVIDERS[provider];
      const source = sourceFor(provider);
      title.textContent = details.name;
      copy.textContent = providerCopy(provider);
      statusRoot.innerHTML = `<div class="connection-state ${source?.status === 'connected' ? 'connected' : ''}"><span></span><div><strong>${source?.status === 'connected' ? ctx.t('health.connectedDemo') : ctx.t('health.notConnected')}</strong><small>${source?.lastSync ? ctx.t('health.lastImport', { date: ctx.formatDateTime(source.lastSync) }) : ctx.t('health.noImportYet')}</small></div></div>`;
      demoButton.textContent = source?.status === 'connected' ? ctx.t('health.disconnectDemo') : ctx.t('health.simulateConnection');
      if (!dialog.open) { if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', ''); }
    }

    function demoEntries(provider) {
      const seed = { apple: 0, 'health-connect': 1, samsung: 2, huawei: 3 }[provider] || 0;
      return Array.from({ length: 7 }, (_, index) => {
        const date = new Date();
        date.setDate(date.getDate() - index);
        const iso = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
        return {
          id: ctx.uid(), date: iso, source: provider,
          sleep: Number((6.5 + ((index + seed) % 4) * .45).toFixed(1)),
          mood: 2 + ((index + seed) % 3), energy: 5 + ((index + seed) % 4), stress: 3 + ((index + 1) % 4),
          hydration: Number((1.4 + ((index + seed) % 4) * .25).toFixed(1)), steps: 5200 + ((index + seed) % 5) * 1100,
          restingHR: 59 + ((index + seed) % 6), activeMinutes: 28 + ((index + seed) % 5) * 8,
          hrv: 38 + ((index + seed) % 7) * 3, bloodOxygen: Number((96.2 + ((index + seed) % 4) * .5).toFixed(1)),
          respiratoryRate: Number((13.5 + ((index + seed) % 4) * .4).toFixed(1)), calories: 280 + ((index + seed) % 5) * 70
        };
      });
    }

    async function toggleConnection() {
      const source = sourceFor(selectedProvider);
      if (source?.status === 'connected') {
        ctx.updateState((state) => { state.healthSources = state.healthSources.filter((item) => item.provider !== selectedProvider); });
        ctx.toast(ctx.t('health.disconnected'));
        openProvider(selectedProvider);
        return;
      }
      const bridge = window.SUM_NATIVE_HEALTH;
      const availability = bridge?.available ? await bridge.available(selectedProvider) : { available: false };
      if (availability?.available && bridge?.connect) {
        try {
          await bridge.connect(selectedProvider);
          ctx.updateState((state) => { state.healthSources.push({ provider: selectedProvider, status: 'connected', mode: 'native', lastSync: new Date().toISOString() }); });
          ctx.toast(ctx.t('health.connected'));
          openProvider(selectedProvider);
          return;
        } catch {
          ctx.toast(ctx.t('health.connectionFailed'), 'error');
          return;
        }
      }
      ctx.toast(ctx.t('health.connectionFailed'), 'error');
      statusRoot.innerHTML = `<div class="connection-state"><span></span><div><strong>${ctx.escape(detailsFor(selectedProvider).name)}</strong><small>Application mobile native requise. Utilisez l’import de démonstration uniquement pour tester l’interface.</small></div></div>`;
    }

    async function importDemo() {
      const existingSource = sourceFor(selectedProvider);
      let entries = [];
      let mode = existingSource?.mode || 'demo';
      if (mode === 'native' && window.SUM_NATIVE_HEALTH?.sync) {
        try {
          entries = (await window.SUM_NATIVE_HEALTH.sync(selectedProvider, 14)).map((item) => ({ id: item.id || ctx.uid(), source: selectedProvider, ...item }));
        } catch { return ctx.toast(ctx.t('health.connectionFailed'), 'error'); }
      }
      if (mode === 'native' && !entries.length) return ctx.toast(ctx.t('health.connectionFailed'), 'error');
      if (!entries.length) { entries = demoEntries(selectedProvider); mode = 'demo'; }
      ctx.updateState((state) => {
        const existingDates = new Set(state.health.filter((item) => item.source === selectedProvider).map((item) => item.date));
        state.health.unshift(...entries.filter((item) => item.date && !existingDates.has(item.date)));
        const source = state.healthSources.find((item) => item.provider === selectedProvider);
        if (source) { source.lastSync = new Date().toISOString(); source.mode = mode; }
        else state.healthSources.push({ provider: selectedProvider, status: 'connected', mode, lastSync: new Date().toISOString() });
      });
      ctx.toast(mode === 'native' ? ctx.t('health.connected') : ctx.t('health.demoImported'));
      openProvider(selectedProvider);
    }

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(form);
      ctx.updateState((state) => {
        state.health.unshift({
          id: ctx.uid(), date: data.get('date') || ctx.today(), sleep: numberOrZero(data.get('sleep')), mood: numberOrZero(data.get('mood')),
          energy: numberOrZero(data.get('energy')), stress: numberOrZero(data.get('stress')), hydration: numberOrZero(data.get('hydration')),
          steps: numberOrZero(data.get('steps')), restingHR: numberOrZero(data.get('restingHR')), activeMinutes: numberOrZero(data.get('activeMinutes')),
          hrv: numberOrZero(data.get('hrv')), bloodOxygen: numberOrZero(data.get('bloodOxygen')), respiratoryRate: numberOrZero(data.get('respiratoryRate')),
          weight: numberOrZero(data.get('weight')), calories: numberOrZero(data.get('calories')), source: 'manual'
        });
      });
      form.reset();
      form.elements.date.value = ctx.today();
      ctx.toast(ctx.t('toast.healthAdded'));
    });

    list.addEventListener('click', (event) => {
      const button = event.target.closest('[data-health-delete]');
      if (!button) return;
      ctx.updateState((state) => { state.health = state.health.filter((item) => item.id !== button.dataset.healthDelete); });
    });
    deviceGrid?.querySelectorAll('[data-health-provider]').forEach((button) => {
      button.addEventListener('click', () => openProvider(button.dataset.healthProvider));
      button.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openProvider(button.dataset.healthProvider); }
      });
    });
    closeButton?.addEventListener('click', () => { if (typeof dialog.close === 'function') dialog.close(); else dialog.removeAttribute('open'); });
    demoButton?.addEventListener('click', toggleConnection);
    importButton?.addEventListener('click', importDemo);

    ctx.subscribe(render);
    document.addEventListener('languagechange', render);
    render();
    return { render };
  }

  window.SUM_MODULES = window.SUM_MODULES || {};
  window.SUM_MODULES.initHealth = initHealth;
})();
