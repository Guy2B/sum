'use strict';
(() => {
  const { init: initI18n, t, getLanguage, setLanguage } = window.SUM_I18N;
  const {
    initTasks, initProjects, initFinance, initHealth,
    initJournal, initLearning, initPlanner, initCalendarConnect, initContext, initMail, initSocial, initAiSettings, initCoach, initDashboard, initExperienceV17
  } = window.SUM_MODULES;
  const CONFIG = window.SUM_CONFIG;
  const EDITIONS = window.SUM_EDITIONS;
  const URL_PARAMS = new URLSearchParams(location.search);
  const REQUESTED_EDITION = URL_PARAMS.has('edition') ? EDITIONS.normalize(URL_PARAMS.get('edition')) : '';
  const PRO_PANELS = new Set(['projects', 'finance', 'health']);
  const LEGACY_KEY = 'algb-life-os-state-v1';
  const DEVICE_KEY = 'sum-algbr-device-id';

  const defaultState = {
    version: 4,
    tasks: [], projects: [], finance: [], health: [], healthSources: [], journal: [], learning: [], learningResources: [], calendarAccounts: [],
    mailAccounts: [], mailMessages: [], mailSettings: { lastSync: null, filter: 'all' },
    contextProfile: { primaryGoal: '', secondaryGoal: '', successDefinition: '', weeklyHours: 20, focusHours: 4, energyPeak: 'morning', workDays: ['mon','tue','wed','thu','fri'], fixedCommitments: '', currentPressure: '', constraints: '', coachingTone: 'balanced', coachingDepth: 'detailed', allowCrossAnalysis: true, includedDomains: { mail: true, social: true, health: true, finance: true, journal: true, learning: true }, updatedAt: null },
    contextCheckins: [],
    intelligence: { feedback: [], preferences: {}, lastAnalysis: null },
    socialAccounts: [], socialInteractions: [], socialSettings: { lastSync: null, filter: 'priority' },
    goals: [], habits: [], habitLogs: [], events: [],
    coachHistory: [], coachInsights: [], lastCoachRun: null,
    coachSession: { intent: 'general', pendingSlot: '', context: {} },
    settings: { name: '', profile: 'solo', businessSize: 'solo', currency: 'EUR', freeLanguage: '', onboardingComplete: false, localAiEnabled: false, semanticAiEnabled: false },
    license: null,
    ownerPreview: false,
    usage: { coachDate: '', coachCount: 0 },
    lastSync: null
  };

  const clone = (value) => typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value));
  let state = loadState();
  if (REQUESTED_EDITION) { state.settings.profile = REQUESTED_EDITION; persist(); }
  let pendingCheckout = URL_PARAMS.get('checkout');
  if (!['monthly', 'annual'].includes(pendingCheckout)) pendingCheckout = '';
  const subscribers = new Set();
  let toastTimer;

  function normalize(raw = {}) {
    const next = { ...clone(defaultState), ...(raw && typeof raw === 'object' ? raw : {}) };
    ['tasks', 'projects', 'finance', 'health', 'healthSources', 'journal', 'learning', 'learningResources', 'calendarAccounts', 'mailAccounts', 'mailMessages', 'socialAccounts', 'socialInteractions', 'goals', 'habits', 'habitLogs', 'events', 'coachHistory', 'coachInsights', 'contextCheckins'].forEach((key) => {
      if (!Array.isArray(next[key])) next[key] = [];
    });
    next.settings = { ...clone(defaultState.settings), ...(raw.settings || {}) };
    next.settings.profile = EDITIONS.normalize(next.settings.profile);
    next.usage = { ...clone(defaultState.usage), ...(raw.usage || {}) };
    next.coachSession = { ...clone(defaultState.coachSession), ...(raw.coachSession || {}) };
    next.mailSettings = { ...clone(defaultState.mailSettings), ...(raw.mailSettings || {}) };
    next.calendarSettings = { lastSync: null, ...(raw.calendarSettings || {}) };
    next.contextProfile = { ...clone(defaultState.contextProfile), ...(raw.contextProfile || {}), includedDomains: { ...clone(defaultState.contextProfile.includedDomains), ...(raw.contextProfile?.includedDomains || {}) } };
    next.socialSettings = { ...clone(defaultState.socialSettings), ...(raw.socialSettings || {}) };
    next.intelligence = { ...clone(defaultState.intelligence), ...(raw.intelligence || {}) };
    if (!Array.isArray(next.intelligence.feedback)) next.intelligence.feedback = [];
    next.ownerPreview = Boolean(raw.ownerPreview);
    if (!next.coachHistory.length && Array.isArray(raw.aiHistory)) next.coachHistory = raw.aiHistory;
    return next;
  }

  function loadState() {
    try {
      const stored = JSON.parse(localStorage.getItem(CONFIG.storageKey));
      if (stored) return normalize(stored);
      const legacy = JSON.parse(localStorage.getItem(LEGACY_KEY));
      if (legacy) {
        const migrated = normalize(legacy);
        localStorage.setItem(CONFIG.storageKey, JSON.stringify(migrated));
        return migrated;
      }
    } catch { /* clean state below */ }
    return clone(defaultState);
  }

  function persist() {
    localStorage.setItem(CONFIG.storageKey, JSON.stringify(state));
  }

  function getState() { return state; }
  function updateState(mutator) {
    mutator(state);
    persist();
    subscribers.forEach((callback) => callback(state));
  }
  function replaceState(nextState, options = {}) {
    const preservedLicense = options.preserveLicense ? state.license : null;
    state = normalize(nextState);
    if (preservedLicense) state.license = preservedLicense;
    persist();
    subscribers.forEach((callback) => callback(state));
  }
  function subscribe(callback) { subscribers.add(callback); return () => subscribers.delete(callback); }

  function uid() {
    const random = globalThis.crypto?.getRandomValues ? globalThis.crypto.getRandomValues(new Uint32Array(1))[0] : Math.floor(Math.random() * 0xffffffff);
    return `${Date.now().toString(36)}-${random.toString(36)}`;
  }
  function deviceId() {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) { id = `dev-${uid()}`; localStorage.setItem(DEVICE_KEY, id); }
    return id;
  }
  function escapeHTML(value = '') { return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character])); }
  function today() { const date = new Date(); return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10); }
  function locale() { return ({ en: 'en-GB', fr: 'fr-FR', de: 'de-DE', es: 'es-ES' })[getLanguage()] || 'en-GB'; }
  function formatDate(value) { if (!value) return ''; return new Intl.DateTimeFormat(locale(), { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${value}T12:00:00`)); }
  function shortDate(value) { if (!value) return ''; return new Intl.DateTimeFormat(locale(), { day: 'numeric', month: 'short' }).format(new Date(`${value}T12:00:00`)); }
  function formatDateTime(value) { if (!value) return ''; return new Intl.DateTimeFormat(locale(), { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value)); }
  function currency(value) { return new Intl.NumberFormat(locale(), { style: 'currency', currency: state.settings.currency || 'EUR', maximumFractionDigits: 2 }).format(Number(value) || 0); }
  function toast(message, kind = 'success') {
    const element = document.getElementById('toast');
    element.textContent = message;
    element.dataset.kind = kind;
    element.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => element.classList.remove('show'), 3000);
  }

  function isLocalEnvironment() { return location.protocol === 'file:' || ['localhost', '127.0.0.1'].includes(location.hostname); }
  function isOwnerPreview() {
    if (CONFIG.adminQaEnabled && Boolean(state.ownerPreview)) return true;
    return Boolean(state.ownerPreview) && CONFIG.allowOwnerPreviewOnLocalhost && isLocalEnvironment();
  }
  function isPro() {
    if (isOwnerPreview()) return true;
    const license = state.license;
    if (!license || license.plan !== 'pro' || license.status !== 'active') return false;
    if (license.expiresAt && new Date(license.expiresAt).getTime() < Date.now()) return false;
    return true;
  }
  function getCoachUsage() {
    if (state.usage.coachDate !== today()) return 0;
    return Number(state.usage.coachCount) || 0;
  }
  function consumeCoachUse() {
    if (isPro()) return true;
    const date = today();
    const count = state.usage.coachDate === date ? Number(state.usage.coachCount) || 0 : 0;
    if (count >= CONFIG.freeCoachLimit) return false;
    updateState((draft) => { draft.usage.coachDate = date; draft.usage.coachCount = count + 1; });
    return true;
  }

  function greeting() {
    const name = state.settings.name?.trim();
    const hour = new Date().getHours();
    const part = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
    const messages = {
      en: { morning: 'Good morning', afternoon: 'Good afternoon', evening: 'Good evening' },
      fr: { morning: 'Bonjour', afternoon: 'Bon après-midi', evening: 'Bonsoir' },
      de: { morning: 'Guten Morgen', afternoon: 'Guten Tag', evening: 'Guten Abend' },
      es: { morning: 'Buenos días', afternoon: 'Buenas tardes', evening: 'Buenas noches' }
    };
    return `${messages[getLanguage()]?.[part] || messages.en[part]}${name ? `, ${name}` : ''}`;
  }

  function edition() { return EDITIONS.get(state.settings.profile, getLanguage()); }
  function editionUiCopy(language = getLanguage()) {
    const copy = {
      en: { change: 'Change edition', choose: 'Choose your Σ edition', intro: 'Choose the edition that best matches your current life and work.', templates: 'Included templates', prompts: 'Σ suggestions', demo: 'Load current edition demo', saved: 'Σ edition updated.' },
      fr: { change: "Changer d’édition", choose: 'Choisissez votre édition Σ', intro: 'Choisissez l’édition qui correspond le mieux à votre vie et à votre activité actuelles.', templates: 'Modèles inclus', prompts: 'Suggestions Σ', demo: 'Charger la démo de cette édition', saved: 'Édition Σ mise à jour.' },
      de: { change: 'Edition wechseln', choose: 'Σ-Edition wählen', intro: 'Wählen Sie die Edition, die am besten zu Ihrem aktuellen Leben und Ihrer Arbeit passt.', templates: 'Enthaltene Vorlagen', prompts: 'Σ Vorschläge', demo: 'Demo dieser Edition laden', saved: 'Σ-Edition aktualisiert.' },
      es: { change: 'Cambiar edición', choose: 'Elige tu edición Σ', intro: 'Elige la edición que mejor encaja con tu vida y trabajo actuales.', templates: 'Plantillas incluidas', prompts: 'Sugerencias de Σ', demo: 'Cargar demo de esta edición', saved: 'Edición Σ actualizada.' }
    };
    return copy[language] || copy.en;
  }
  function setText(id, value) { const element = document.getElementById(id); if (element && value != null) element.textContent = value; }
  function renderEditionSelect(selected = state.settings.profile) {
    const select = document.getElementById('account-edition-select');
    if (!select) return;
    const current = EDITIONS.normalize(selected);
    select.innerHTML = EDITIONS.list(getLanguage()).map((item) => `<option value="${item.key}">${escapeHTML(item.icon)} ${escapeHTML(item.name)}</option>`).join('');
    select.value = current;
  }
  function renderEditionChoices(language = getLanguage(), selected = state.settings.profile || REQUESTED_EDITION || 'solo') {
    const root = document.getElementById('onboarding-edition-choice');
    if (!root) return;
    const current = EDITIONS.normalize(selected);
    root.innerHTML = EDITIONS.list(language).map((item) => `<label class="edition-choice-card" style="--choice-accent:${item.accent}"><input type="radio" name="profile" value="${item.key}" ${item.key === current ? 'checked' : ''}><span><b class="edition-choice-icon">${escapeHTML(item.icon)}</b><strong>${escapeHTML(item.name)}</strong><small>${escapeHTML(item.promise)}</small></span></label>`).join('');
  }
  function renderEditionDialog() {
    const grid = document.getElementById('edition-dialog-grid');
    if (!grid) return;
    const current = state.settings.profile;
    grid.innerHTML = EDITIONS.list(getLanguage()).map((item) => `
      <button class="edition-dialog-card ${item.key === current ? 'active' : ''}" type="button" data-edition-select="${item.key}" style="--choice-accent:${item.accent}">
        <span class="edition-dialog-icon">${escapeHTML(item.icon)}</span>
        <span><strong>${escapeHTML(item.name)}</strong><small>${escapeHTML(item.promise)}</small></span>
        <b>${item.key === current ? '✓' : '→'}</b>
      </button>`).join('');
  }

  function openEditionDialog() {
    renderEditionDialog();
    document.getElementById('edition-dialog')?.showModal();
  }

  function applyEditionUI() {
    const item = edition();
    const copy = editionUiCopy();
    document.body.dataset.edition = item.key;
    document.documentElement.style.setProperty('--edition-accent', item.accent);
    document.documentElement.style.setProperty('--edition-soft', item.soft);
    setText('edition-context-icon', item.icon);
    setText('edition-context-name', item.name);
    setText('edition-context-title', item.hero);
    setText('edition-context-promise', item.promise);
    setText('edition-change-button', copy.change);
    setText('dashboard-edition-subtitle', item.promise);
    setText('dashboard-label-priority', item.labels.priority);
    setText('dashboard-title-essentials', item.labels.essentials);
    setText('dashboard-title-habits', item.labels.habits);
    setText('dashboard-label-focus', item.labels.focus);
    const templates = document.getElementById('account-edition-templates');
    if (templates) templates.innerHTML = item.templates.slice(0, 4).map((template) => `<span>${escapeHTML(template)}</span>`).join('');
    const navMap = { tasks: item.nav.tasks, planner: item.nav.planner, projects: item.nav.projects, finance: item.nav.finance, health: item.nav.health, learning: item.nav.learning };
    Object.entries(navMap).forEach(([key, value]) => { setText(`nav-label-${key}`, value); setText(`shortcut-label-${key}`, value); });
    setText('coach-edition-badge', item.name);
    setText('coach-edition-presence', item.coachWelcome);
    setText('account-edition-icon', item.icon);
    setText('account-edition-name', item.name);
    setText('account-edition-hero', item.hero);
    setText('account-edition-promise', item.promise);
    setText('account-edition-templates-title', copy.templates);
    setText('account-edition-coach-title', copy.prompts);
    const accountTemplates = document.getElementById('account-edition-templates');
    if (accountTemplates) accountTemplates.innerHTML = item.templates.map((template) => `<span>${escapeHTML(template)}</span>`).join('');
    const accountPrompts = document.getElementById('account-edition-prompts');
    if (accountPrompts) accountPrompts.innerHTML = item.prompts.map(([label, prompt]) => `<button type="button" data-edition-coach-prompt="${escapeHTML(prompt)}"><span>Σ</span>${escapeHTML(label)}</button>`).join('');
    setText('owner-preview-seed', copy.demo);
    setText('onboarding-edition-legend', copy.choose);
    setText('onboarding-edition-intro', copy.intro);
    renderEditionSelect();
    renderEditionDialog();
  }
  function initEditions() {
    renderEditionChoices(getLanguage(), state.settings.profile || REQUESTED_EDITION || 'solo');
    applyEditionUI();
    document.addEventListener('languagechange', () => { renderEditionChoices(getLanguage(), document.querySelector('#onboarding-edition-choice input:checked')?.value || state.settings.profile); applyEditionUI(); });
    subscribe(applyEditionUI);
    document.addEventListener('click', (event) => {
      const prompt = event.target.closest('[data-edition-coach-prompt]');
      if (prompt) document.dispatchEvent(new CustomEvent('sum:coach-prompt', { detail: { text: prompt.dataset.editionCoachPrompt } }));
      if (event.target.closest('#edition-change-button') || event.target.closest('[data-open-editions]')) openEditionDialog();
      const editionButton = event.target.closest('[data-edition-select]');
      if (editionButton) {
        updateState((draft) => { draft.settings.profile = EDITIONS.normalize(editionButton.dataset.editionSelect); });
        document.getElementById('edition-dialog')?.close();
        applyEditionUI();
        toast(editionUiCopy().saved);
      }
      if (event.target.closest('#edition-dialog-close')) document.getElementById('edition-dialog')?.close();
      const adminEdition = event.target.closest('[data-admin-edition]');
      if (adminEdition && isOwnerPreview()) {
        updateState((draft) => { draft.settings.profile = EDITIONS.normalize(adminEdition.dataset.adminEdition); });
        populateProfile(); applyEditionUI(); toast(`${edition().name} · ADMIN`);
      }
    });
  }

  const ctx = {
    getState, updateState, replaceState, subscribe, uid, escape: escapeHTML, today, formatDate, shortDate, formatDateTime,
    currency, toast, t, language: getLanguage, navigate, isPro, isOwnerPreview, openUpgrade, getCoachUsage, consumeCoachUse, greeting, edition
  };

  function navigate(panelName, options = {}) {
    if (PRO_PANELS.has(panelName) && !isPro()) { openUpgrade(); return false; }
    const target = document.getElementById(`panel-${panelName}`);
    if (!target) return false;
    document.querySelectorAll('.panel').forEach((panel) => panel.classList.toggle('active', panel === target));
    document.querySelectorAll('[data-panel]').forEach((button) => button.classList.toggle('active', button.dataset.panel === panelName));
    document.body.dataset.currentPanel = panelName;
    if (!options.preserveScroll) window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    try { history.replaceState(null, '', `#${panelName}`); } catch { location.hash = panelName; }
    closeMobileSidebar();
    window.setTimeout(() => window.dispatchEvent(new Event('resize')), options.instant ? 0 : 260);
    return true;
  }

  function initNavigation() {
    document.addEventListener('click', (event) => {
      const navButton = event.target.closest('[data-panel]');
      if (navButton) navigate(navButton.dataset.panel);
      const comingSoon = event.target.closest('[data-coming-soon]');
      if (comingSoon) toast(t('toast.comingSoon'));
    });
    const initial = location.hash.slice(1);
    navigate(document.getElementById(`panel-${initial}`) ? initial : 'dashboard', { preserveScroll: true, instant: true });
  }

  function initTheme() {
    const preferredDark = matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.dataset.theme = localStorage.getItem(CONFIG.themeKey) || (preferredDark ? 'dark' : 'light');
    document.getElementById('theme-toggle').addEventListener('click', () => {
      const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      localStorage.setItem(CONFIG.themeKey, next);
      document.dispatchEvent(new Event('languagechange'));
    });
  }

  function openMobileSidebar() { document.getElementById('sidebar').classList.add('open'); document.getElementById('mobile-overlay').classList.add('show'); }
  function closeMobileSidebar() { document.getElementById('sidebar').classList.remove('open'); document.getElementById('mobile-overlay').classList.remove('show'); }
  function initMobileControls() {
    document.getElementById('menu-toggle').addEventListener('click', openMobileSidebar);
    document.getElementById('mobile-more').addEventListener('click', openMobileSidebar);
    document.getElementById('mobile-overlay').addEventListener('click', closeMobileSidebar);
  }

  function initDates() {
    document.querySelectorAll('input[type="date"]').forEach((input) => { if (!input.value) input.value = today(); });
    const render = () => { document.getElementById('today-chip').textContent = new Intl.DateTimeFormat(locale(), { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date()); };
    render();
    document.addEventListener('languagechange', render);
  }

  function initRanges() {
    document.addEventListener('input', (event) => {
      if (event.target.matches('input[type="range"]')) {
        const output = event.target.nextElementSibling;
        if (output?.tagName === 'OUTPUT') output.value = event.target.name === 'progress' ? `${event.target.value}%` : event.target.value;
      }
    });
  }

  function initQuickAdd() {
    const dialog = document.getElementById('quick-dialog');
    document.getElementById('fab').addEventListener('click', () => dialog.showModal());
    document.getElementById('quick-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
      const button = event.target.closest('[data-quick-panel]');
      if (!button) return;
      if (navigate(button.dataset.quickPanel)) {
        dialog.close();
        window.setTimeout(() => document.querySelector(button.dataset.focus)?.focus(), 180);
      }
    });
  }

  function getSearchItems() {
    return [
      ...state.tasks.map((item) => ({ panel: 'tasks', title: item.title, meta: t('nav.tasks') })),
      ...state.projects.map((item) => ({ panel: 'projects', title: item.name, meta: t('nav.projects') })),
      ...state.finance.map((item) => ({ panel: 'finance', title: item.description, meta: item.category })),
      ...state.journal.map((item) => ({ panel: 'journal', title: item.text.slice(0, 70), meta: formatDate(item.date) })),
      ...state.learning.map((item) => ({ panel: 'learning', title: item.name, meta: item.target })),
      ...state.goals.map((item) => ({ panel: 'planner', title: item.title, meta: t(`planner.${item.period || 'week'}`) })),
      ...state.habits.map((item) => ({ panel: 'planner', title: item.name, meta: t('planner.habits') })),
      ...state.events.map((item) => ({ panel: 'planner', title: item.title, meta: formatDate(item.date) })),
      ...state.socialInteractions.filter((item) => !item.handled).map((item) => ({ panel: 'social', title: item.title || item.content || 'Social interaction', meta: `${item.sender || ''} · ${item.provider || ''}` })),
      ...(state.contextProfile.primaryGoal ? [{ panel: 'context', title: state.contextProfile.primaryGoal, meta: t('context.nav') }] : [])
    ];
  }

  function initSearch() {
    const input = document.getElementById('global-search');
    const results = document.getElementById('search-results');
    const hide = () => { results.hidden = true; results.innerHTML = ''; };
    input.addEventListener('input', () => {
      const query = input.value.trim().toLowerCase();
      if (!query) return hide();
      const matches = getSearchItems().filter((item) => `${item.title} ${item.meta}`.toLowerCase().includes(query)).slice(0, 8);
      results.innerHTML = matches.length ? matches.map((item) => `<button type="button" data-search-panel="${item.panel}"><span>${escapeHTML(item.title)}</span><small>${escapeHTML(item.meta || '')}</small></button>`).join('') : `<div class="empty-state compact">${t('common.noData')}</div>`;
      results.hidden = false;
    });
    results.addEventListener('click', (event) => {
      const button = event.target.closest('[data-search-panel]');
      if (!button) return;
      navigate(button.dataset.searchPanel);
      input.value = '';
      hide();
    });
    document.addEventListener('click', (event) => { if (!event.target.closest('.global-search')) hide(); });
    document.addEventListener('keydown', (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); input.focus(); }
      if (event.key === 'Escape') hide();
    });
  }

  function initOnboarding() {
    const dialog = document.getElementById('onboarding-dialog');
    const form = document.getElementById('onboarding-form');
    form.elements.language.value = getLanguage();
    renderEditionChoices(getLanguage(), REQUESTED_EDITION || state.settings.profile || 'solo');
    form.elements.language.addEventListener('change', () => {
      const selected = form.querySelector('input[name="profile"]:checked')?.value || state.settings.profile;
      renderEditionChoices(String(form.elements.language.value), selected);
    });
    if (!state.settings.onboardingComplete) window.setTimeout(() => dialog.showModal(), 120);
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const language = String(data.get('language'));
      updateState((draft) => {
        draft.settings.name = String(data.get('name')).trim();
        draft.settings.profile = EDITIONS.normalize(data.get('profile'));
        draft.settings.businessSize = String(data.get('businessSize') || 'solo');
        draft.settings.currency = String(data.get('currency'));
        draft.settings.freeLanguage = language;
        draft.settings.onboardingComplete = true;
      });
      setLanguage(language);
      dialog.close();
      populateProfile();
      applyEditionUI();
      presentPendingCheckout();
    });
  }

  function allowedFreeLanguages() {
    const primary = state.settings.freeLanguage || getLanguage() || 'en';
    return new Set([primary, 'en']);
  }

  function refreshLanguageOptions() {
    const selector = document.getElementById('language-select');
    if (!selector) return;
    const allowed = isPro() ? new Set(['en', 'fr', 'de', 'es']) : allowedFreeLanguages();
    if (!allowed.has(getLanguage())) {
      setLanguage(state.settings.freeLanguage || 'en');
      return;
    }
    [...selector.options].forEach((option) => {
      const baseLabel = option.dataset.label || option.textContent.replace(/ · PRO$/, '');
      option.dataset.label = baseLabel;
      const locked = !allowed.has(option.value);
      option.disabled = locked;
      option.textContent = `${baseLabel}${locked ? ' · PRO' : ''}`;
    });
    selector.value = getLanguage();
  }

  function initLanguageSelector() {
    const selector = document.getElementById('language-select');
    [...selector.options].forEach((option) => { option.dataset.label = option.textContent; });
    refreshLanguageOptions();
    selector.addEventListener('change', () => {
      const requested = selector.value;
      if (!isPro() && !allowedFreeLanguages().has(requested)) {
        selector.value = getLanguage();
        toast(t('toast.languagePro'), 'error');
        openUpgrade();
        return;
      }
      setLanguage(requested);
    });
    subscribe(refreshLanguageOptions);
    document.addEventListener('languagechange', refreshLanguageOptions);
  }

  let selectedBilling = 'annual';

  function paymentProviderName() {
    const provider = String(CONFIG.paymentProvider || 'hosted-checkout').toLowerCase();
    if (provider.includes('paypal')) return 'PayPal';
    if (provider.includes('lemon')) return 'Lemon Squeezy';
    if (provider.includes('paddle')) return 'Paddle';
    return 'Hosted checkout';
  }

  function selectedCheckoutUrl() {
    return selectedBilling === 'monthly' ? CONFIG.monthlyCheckoutUrl : CONFIG.annualCheckoutUrl;
  }

  function presentPendingCheckout() {
    if (!pendingCheckout || !state.settings.onboardingComplete) return;
    const period = pendingCheckout;
    pendingCheckout = '';
    const cleanUrl = `${location.pathname}${location.hash || ''}`;
    try { history.replaceState({}, '', cleanUrl); } catch { /* file:// may restrict history rewriting */ }
    selectBilling(period);
    window.setTimeout(() => openUpgrade(), 220);
  }

  function selectBilling(period) {
    selectedBilling = period === 'monthly' ? 'monthly' : 'annual';
    document.querySelectorAll('[data-billing]').forEach((card) => card.classList.toggle('selected', card.dataset.billing === selectedBilling));
    const button = document.getElementById('checkout-button');
    if (button) button.dataset.billing = selectedBilling;
    updatePaymentUI();
  }

  function updatePaymentUI() {
    const url = selectedCheckoutUrl();
    const localSimulation = Boolean(CONFIG.allowCheckoutSimulationOnLocalhost && isLocalEnvironment());
    const provider = paymentProviderName();
    const mode = String(CONFIG.paymentMode || 'test').toUpperCase();
    const status = document.getElementById('checkout-status');
    const statusTitle = document.getElementById('checkout-status-title');
    const statusCopy = document.getElementById('checkout-status-copy');
    const checkoutLabel = document.getElementById('checkout-button-label');
    const adminStatus = document.getElementById('payment-admin-status');
    const providerLabel = document.getElementById('payment-provider-label');
    const configLabel = document.getElementById('payment-config-label');

    let stateName = 'unconfigured';
    let titleKey = 'payment.notConfigured';
    let copyKey = 'payment.notConfiguredText';
    let buttonKey = 'payment.configureFirst';
    if (url) {
      stateName = CONFIG.paymentMode === 'live' ? 'ready' : 'test';
      titleKey = CONFIG.paymentMode === 'live' ? 'payment.liveReady' : 'payment.testReady';
      copyKey = CONFIG.paymentMode === 'live' ? 'payment.liveReadyText' : 'payment.testReadyText';
      buttonKey = CONFIG.paymentMode === 'live' ? 'upgrade.checkout' : 'payment.openTestCheckout';
    } else if (localSimulation) {
      stateName = 'test';
      titleKey = 'payment.localSimulation';
      copyKey = 'payment.localSimulationText';
      buttonKey = 'payment.trySimulation';
    }

    if (status) {
      status.dataset.state = stateName;
      statusTitle.textContent = t(titleKey, { provider, mode });
      statusCopy.textContent = t(copyKey, { provider, mode });
    }
    if (checkoutLabel) checkoutLabel.textContent = t(buttonKey);
    if (adminStatus) {
      adminStatus.dataset.state = url ? (CONFIG.paymentMode === 'live' ? 'ready' : 'test') : 'unconfigured';
      providerLabel.textContent = `${provider} · ${mode}`;
      const monthly = CONFIG.monthlyCheckoutUrl ? t('payment.configured') : t('payment.missing');
      const annual = CONFIG.annualCheckoutUrl ? t('payment.configured') : t('payment.missing');
      configLabel.textContent = t('payment.configSummary', { monthly, annual });
    }
  }

  function openPaymentTest() {
    if (!CONFIG.allowCheckoutSimulationOnLocalhost || !isLocalEnvironment()) {
      toast(t('payment.localUnavailable'), 'error');
      return;
    }
    const dialog = document.getElementById('payment-test-dialog');
    document.getElementById('payment-test-plan').textContent = selectedBilling === 'monthly'
      ? `Σ Pro · ${CONFIG.prices.monthly}`
      : `Σ Pro · ${CONFIG.prices.annual}`;
    document.getElementById('payment-test-provider').textContent = paymentProviderName();
    document.getElementById('payment-test-mode').textContent = String(CONFIG.paymentMode || 'test').toUpperCase();
    if (!dialog.open) dialog.showModal();
  }

  function openUpgrade() {
    document.getElementById('monthly-price').textContent = CONFIG.prices.monthly;
    document.getElementById('annual-price').textContent = CONFIG.prices.annual;
    selectBilling('annual');
    const dialog = document.getElementById('upgrade-dialog');
    if (!dialog.open) dialog.showModal();
  }

  function initUpgrade() {
    const dialog = document.getElementById('upgrade-dialog');
    const paymentDialog = document.getElementById('payment-test-dialog');
    document.querySelectorAll('[data-upgrade]').forEach((button) => button.addEventListener('click', openUpgrade));
    document.querySelectorAll('[data-billing]').forEach((card) => {
      card.addEventListener('click', () => selectBilling(card.dataset.billing));
      card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectBilling(card.dataset.billing); }
      });
    });
    document.getElementById('upgrade-close').addEventListener('click', () => dialog.close());
    document.getElementById('upgrade-activate').addEventListener('click', () => { dialog.close(); navigate('account'); window.setTimeout(() => document.querySelector('#licence-form input[name=license]')?.focus(), 150); });
    document.getElementById('checkout-button').addEventListener('click', () => {
      const url = selectedCheckoutUrl();
      if (url) { window.open(url, '_blank', 'noopener,noreferrer'); return; }
      if (CONFIG.allowCheckoutSimulationOnLocalhost && isLocalEnvironment()) { dialog.close(); openPaymentTest(); return; }
      toast(t('upgrade.notConfigured'), 'error');
    });
    document.getElementById('payment-test-close').addEventListener('click', () => paymentDialog.close());
    document.getElementById('payment-test-open')?.addEventListener('click', openPaymentTest);
    document.getElementById('payment-simulate-success').addEventListener('click', () => {
      if (!isLocalEnvironment()) return;
      updateState((draft) => {
        draft.ownerPreview = false;
        draft.license = {
          email: 'owner-test@local.sum',
          key: `SUM-CHECKOUT-${selectedBilling.toUpperCase()}-TEST`,
          plan: 'pro',
          status: 'active',
          type: `local-${selectedBilling}-checkout-simulation`,
          expiresAt: selectedBilling === 'monthly'
            ? new Date(Date.now() + 31 * 86400000).toISOString()
            : new Date(Date.now() + 366 * 86400000).toISOString(),
          lastValidated: new Date().toISOString()
        };
      });
      paymentDialog.close();
      updatePlanUI();
      toast(t('payment.simulationComplete'));
      navigate('dashboard');
    });
    document.addEventListener('languagechange', updatePaymentUI);
    updatePaymentUI();
  }

  function populateProfile() {
    const form = document.getElementById('profile-form');
    form.elements.name.value = state.settings.name || '';
    renderEditionSelect(state.settings.profile);
    form.elements.profile.value = EDITIONS.normalize(state.settings.profile);
    form.elements.currency.value = state.settings.currency || 'EUR';
  }

  async function apiRequest(action, payload = {}) {
    if (!CONFIG.appsScriptUrl) throw new Error('NO_ENDPOINT');
    const response = await fetch(CONFIG.appsScriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, ...payload })
    });
    if (!response.ok) throw new Error(`HTTP_${response.status}`);
    return response.json();
  }

  async function validateLicense(email, key) {
    const normalizedKey = key.trim();
    if (CONFIG.allowDemoLicenseOnLocalhost && isLocalEnvironment() && normalizedKey.toUpperCase() === CONFIG.demoLicense) {
      return { ok: true, plan: 'pro', status: 'active', type: 'demo', expiresAt: null };
    }
    const result = await apiRequest('validateLicense', { email: email.trim().toLowerCase(), licenseKey: normalizedKey, deviceId: deviceId(), appVersion: CONFIG.version });
    return result;
  }

  function updatePlanUI() {
    const pro = isPro();
    const owner = isOwnerPreview();
    document.body.dataset.plan = pro ? 'pro' : 'free';
    document.body.dataset.ownerPreview = owner ? 'true' : 'false';
    const badge = owner ? 'ADMIN' : pro ? 'PRO' : 'FREE';
    document.getElementById('sidebar-plan').textContent = badge;
    document.getElementById('sidebar-plan').classList.toggle('pro', pro);
    document.getElementById('account-plan-pill').textContent = badge;
    document.getElementById('account-plan-pill').classList.toggle('pro', pro);
    document.getElementById('account-plan-title').textContent = owner ? t('account.ownerPlanTitle') : pro ? 'Σ Pro' : 'Σ Free';
    document.getElementById('account-plan-copy').textContent = owner ? t('account.ownerPlanCopy') : pro ? t('account.proPlanCopy') : t('account.freePlanCopy');
    document.getElementById('plan-subtitle').textContent = owner ? t('account.ownerPlanCopy') : pro ? t('account.proPlanCopy') : t('plan.freeSubtitle');
    refreshLanguageOptions();
    updatePaymentUI();
  }

  function seedDemoWorkspace() {
    const now = new Date();
    const iso = (days = 0) => {
      const date = new Date(now.getTime() + days * 86400000);
      return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    };
    const demo = EDITIONS.demo(state.settings.profile, getLanguage());
    updateState((draft) => {
      draft.version = 3;
      draft.tasks = demo.tasks.map((title, index) => ({ id: uid(), title, priority: index === 0 ? 'high' : index === 1 ? 'medium' : 'low', dueDate: index < 3 ? iso(index) : '', done: false, createdAt: now.toISOString(), category: index === 3 ? 'ideas' : index === 2 ? 'admin' : 'work', urgent: index === 0, important: index < 2, essential: index < 2, estimate: index === 0 ? 45 : index === 1 ? 30 : 20, status: index === 1 ? 'doing' : index === 3 ? 'inbox' : 'todo', inbox: index === 3, subtasks: [] }));
      draft.projects = [{ id: uid(), name: demo.project[0], description: edition().promise, createdAt: new Date(now.getTime() - 5 * 86400000).toISOString(), steps: [{ id: uid(), text: demo.project[1], done: true }, { id: uid(), text: demo.project[2], done: false }] }];
      draft.finance = [{ id: uid(), type: 'income', amount: state.settings.profile === 'student' ? 850 : 1800, description: demo.income, category: 'Income', date: iso(-8), createdAt: now.toISOString() }, { id: uid(), type: 'expense', amount: state.settings.profile === 'student' ? 65 : 420, description: demo.expense, category: 'Tools', date: iso(-3), createdAt: now.toISOString() }];
      draft.health = [{ id: uid(), sleep: 6.5, mood: 2, energy: 4, date: iso(-1), createdAt: now.toISOString() }, { id: uid(), sleep: 7.3, mood: 3, energy: 6, date: iso(-2), createdAt: now.toISOString() }];
      draft.journal = [{ id: uid(), text: demo.journal, gratitude: demo.gratitude, date: iso(-2), createdAt: now.toISOString() }];
      draft.learning = [{ id: uid(), name: demo.skill, target: 'B2', progress: 28, createdAt: now.toISOString() }];
      draft.goals = demo.goals.map((title, index) => ({ id: uid(), title, period: index < 2 ? 'week' : 'month', progress: [35, 60, 45, 20, 75][index], done: false, createdAt: now.toISOString() }));
      const item = edition();
      draft.habits = [{ id: uid(), name: item.key === 'student' ? item.templates[0] : item.key === 'creator' ? 'Deep creation block' : item.key === 'nomad' ? 'Document check' : t('planner.preset.deepWork'), category: 'focus', targetDays: 5, createdAt: now.toISOString() }, { id: uid(), name: t('planner.preset.water'), category: 'health', targetDays: 7, createdAt: now.toISOString() }, { id: uid(), name: item.key === 'nomad' ? demo.skill : t('planner.preset.reading'), category: 'learning', targetDays: 5, createdAt: now.toISOString() }];
      draft.habitLogs = [{ id: uid(), habitId: draft.habits[0].id, date: iso(0), done: true }, { id: uid(), habitId: draft.habits[1].id, date: iso(0), done: true }];
      draft.events = [{ id: uid(), title: demo.events[0], date: iso(1), time: '10:00', category: 'work', reminder: 1, createdAt: now.toISOString() }, { id: uid(), title: demo.events[1], date: iso(4), time: '18:00', category: 'personal', reminder: 3, createdAt: now.toISOString() }];
      draft.coachHistory = [];
      draft.coachInsights = [];
      draft.coachSession = clone(defaultState.coachSession);
      draft.contextProfile = {
        ...clone(defaultState.contextProfile),
        primaryGoal: demo.goals[0] || edition().hero,
        secondaryGoal: demo.skill,
        successDefinition: demo.project[2] || edition().promise,
        weeklyHours: state.settings.profile === 'student' ? 18 : 30,
        focusHours: state.settings.profile === 'student' ? 8 : 12,
        energyPeak: 'morning',
        currentPressure: demo.tasks[0],
        constraints: state.settings.profile === 'nomad' ? 'Travel days and changing time zones.' : 'Protect recovery and avoid more than three essential outcomes per day.',
        updatedAt: now.toISOString()
      };
      draft.contextCheckins = [{ id: uid(), date: iso(0), energy: 6, stress: 5, win: demo.goals[1] || demo.project[1], blocker: demo.tasks[2] || '', focus: demo.goals[0] || '', createdAt: now.toISOString() }];
    });
    toast(`${edition().name} · ${t('admin.demoLoaded')}`);
  }

  function initOwnerPreview() {
    const card = document.getElementById('owner-preview-card');
    if (!card) return;
    const available = CONFIG.allowOwnerPreviewOnLocalhost && isLocalEnvironment();
    card.hidden = !available;
    if (!available) return;
    const form = document.getElementById('owner-preview-form');
    const code = document.getElementById('owner-preview-code');
    const exit = document.getElementById('owner-preview-exit');
    const seed = document.getElementById('owner-preview-seed');
    const message = document.getElementById('owner-preview-message');
    const lab = document.getElementById('admin-edition-lab');
    if (lab) lab.innerHTML = EDITIONS.list(getLanguage()).map((item) => `<button type="button" data-admin-edition="${item.key}" style="--choice-accent:${item.accent}"><span>${escapeHTML(item.icon)}</span><strong>${escapeHTML(item.short)}</strong></button>`).join('');
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (code.value.trim() !== CONFIG.ownerPreviewCode) {
        message.textContent = t('admin.invalidCode');
        message.className = 'form-message error';
        return;
      }
      updateState((draft) => { draft.ownerPreview = true; });
      code.value = '';
      message.textContent = t('admin.enabled');
      message.className = 'form-message';
      updatePlanUI();
    });
    exit.addEventListener('click', () => {
      updateState((draft) => { draft.ownerPreview = false; });
      message.textContent = t('admin.disabled');
      message.className = 'form-message';
      updatePlanUI();
    });
    seed.addEventListener('click', seedDemoWorkspace);
  }

  function initAccount() {
    const profileForm = document.getElementById('profile-form');
    const licenceForm = document.getElementById('licence-form');
    const message = document.getElementById('licence-message');
    populateProfile();

    profileForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(profileForm);
      updateState((draft) => {
        draft.settings.name = String(data.get('name')).trim();
        draft.settings.profile = EDITIONS.normalize(data.get('profile'));
        draft.settings.businessSize = String(data.get('businessSize') || 'solo');
        draft.settings.currency = String(data.get('currency'));
      });
      applyEditionUI();
      toast(editionUiCopy().saved);
    });

    licenceForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const data = new FormData(licenceForm);
      const email = String(data.get('email')).trim().toLowerCase();
      const licenseKey = String(data.get('license')).trim();
      const submit = licenceForm.querySelector('button[type=submit]');
      submit.disabled = true;
      message.textContent = '';
      try {
        const result = await validateLicense(email, licenseKey);
        if (!result.ok || result.status !== 'active' || result.plan !== 'pro') throw new Error('INVALID');
        updateState((draft) => {
          draft.license = { email, key: licenseKey, plan: 'pro', status: 'active', type: result.type || 'subscription', expiresAt: result.expiresAt || null, lastValidated: new Date().toISOString() };
        });
        message.textContent = t('account.activated');
        message.className = 'form-message';
        updatePlanUI();
      } catch {
        message.textContent = t('account.invalidLicense');
        message.className = 'form-message error';
      } finally { submit.disabled = false; }
    });

    document.getElementById('delete-workspace').addEventListener('click', () => {
      const prompts = { en: 'Erase all local Σ data? This cannot be undone.', fr: 'Effacer toutes les données locales de Σ ? Cette action est irréversible.', de: 'Alle lokalen Σ-Daten löschen? Dies kann nicht rückgängig gemacht werden.', es: '¿Borrar todos los datos locales de Σ? Esta acción no se puede deshacer.' };
      if (!window.confirm(prompts[getLanguage()] || prompts.en)) return;
      const currentLanguage = state.settings.freeLanguage || getLanguage();
      state = clone(defaultState);
      state.settings.freeLanguage = currentLanguage;
      localStorage.removeItem(CONFIG.storageKey);
      persist();
      subscribers.forEach((callback) => callback(state));
      populateProfile();
      updatePlanUI();
      toast(t('toast.workspaceDeleted'));
      navigate('dashboard');
      window.setTimeout(() => document.getElementById('onboarding-dialog').showModal(), 180);
    });

    subscribe(() => {
      updatePlanUI();
      if (!document.activeElement?.closest?.('#profile-form')) populateProfile();
    });
    document.addEventListener('languagechange', updatePlanUI);
    updatePlanUI();
  }

  function portableState() {
    const backup = clone(state);
    backup.license = null;
    backup.usage = clone(defaultState.usage);
    return backup;
  }

  function bytesToBase64(bytes) {
    let binary = '';
    bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
    return btoa(binary);
  }
  function base64ToBytes(value) {
    const binary = atob(value);
    return Uint8Array.from(binary, (char) => char.charCodeAt(0));
  }
  async function deriveCryptoKey(secret, salt) {
    const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 120000, hash: 'SHA-256' }, material, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  }
  async function encryptBackup(data, secret) {
    if (!crypto?.subtle) throw new Error('CRYPTO');
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveCryptoKey(secret, salt);
    const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(JSON.stringify(data)));
    return { alg: 'AES-GCM', kdf: 'PBKDF2-SHA256', iterations: 120000, salt: bytesToBase64(salt), iv: bytesToBase64(iv), data: bytesToBase64(new Uint8Array(encrypted)) };
  }
  async function decryptBackup(payload, secret) {
    if (!crypto?.subtle) throw new Error('CRYPTO');
    const salt = base64ToBytes(payload.salt);
    const iv = base64ToBytes(payload.iv);
    const key = await deriveCryptoKey(secret, salt);
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, base64ToBytes(payload.data));
    return JSON.parse(new TextDecoder().decode(decrypted));
  }

  function initSync() {
    const label = document.getElementById('last-sync-label');
    const render = () => { label.textContent = state.lastSync ? formatDateTime(state.lastSync) : t('sync.never'); };

    document.getElementById('sync-export').addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(portableState(), null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `sum-backup-${today()}.json`;
      link.click();
      URL.revokeObjectURL(link.href);
    });

    document.getElementById('sync-import').addEventListener('change', async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      try {
        const imported = JSON.parse(await file.text());
        replaceState(imported, { preserveLicense: true });
        toast(t('sync.imported'));
      } catch { toast(t('common.error'), 'error'); }
      event.target.value = '';
    });

    document.getElementById('sync-push').addEventListener('click', async () => {
      if (!isPro() || !state.license?.key) return toast(t('sync.noLicense'), 'error');
      if (!CONFIG.appsScriptUrl) return toast(t('sync.noEndpoint'), 'error');
      try {
        const secret = `${state.license.email}|${state.license.key}`;
        const encrypted = await encryptBackup(portableState(), secret);
        const result = await apiRequest('pushBackup', { email: state.license.email, licenseKey: state.license.key, deviceId: deviceId(), payload: encrypted, version: CONFIG.version });
        if (!result.ok) throw new Error('PUSH');
        updateState((draft) => { draft.lastSync = new Date().toISOString(); });
        toast(t('sync.pushed'));
      } catch (error) { toast(error.message === 'CRYPTO' ? t('sync.cryptoUnavailable') : t('common.error'), 'error'); }
    });

    document.getElementById('sync-pull').addEventListener('click', async () => {
      if (!isPro() || !state.license?.key) return toast(t('sync.noLicense'), 'error');
      if (!CONFIG.appsScriptUrl) return toast(t('sync.noEndpoint'), 'error');
      try {
        const result = await apiRequest('pullBackup', { email: state.license.email, licenseKey: state.license.key, deviceId: deviceId() });
        if (!result.ok || !result.payload) return toast(t('sync.noBackup'), 'error');
        const secret = `${state.license.email}|${state.license.key}`;
        const restored = await decryptBackup(result.payload, secret);
        replaceState(restored, { preserveLicense: true });
        updateState((draft) => { draft.lastSync = new Date().toISOString(); });
        toast(t('sync.pulled'));
      } catch (error) { toast(error.message === 'CRYPTO' ? t('sync.cryptoUnavailable') : t('common.error'), 'error'); }
    });

    subscribe(render);
    document.addEventListener('languagechange', render);
    render();
  }

  function updateSidebarProfile() {
    const name = state.settings.name || t('common.guest');
    const mode = edition().name;
    document.getElementById('sidebar-profile').innerHTML = `<div class="avatar">${escapeHTML(name.slice(0, 1).toUpperCase())}</div><div><strong>${escapeHTML(name)}</strong><span>${escapeHTML(mode)}</span></div>`;
  }

  function initPWA() {
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('service-worker.js').catch(() => {});
  }

  function initApp() {
    initI18n();
    initTheme();
    initNavigation();
    initMobileControls();
    initDates();
    initRanges();
    initQuickAdd();
    initSearch();
    initEditions();
    initOnboarding();
    initLanguageSelector();
    initUpgrade();
    initAccount();
    initOwnerPreview();
    initSync();
    initTasks(ctx);
    initProjects(ctx);
    initFinance(ctx);
    initHealth(ctx);
    initJournal(ctx);
    initLearning(ctx);
    initPlanner(ctx);
    initCalendarConnect?.(ctx);
    initContext(ctx);
    initMail(ctx);
    initSocial(ctx);
    initAiSettings(ctx);
    initCoach(ctx);
    initDashboard(ctx);
    initExperienceV17?.(ctx);
    subscribe(updateSidebarProfile);
    document.addEventListener('languagechange', updateSidebarProfile);
    updateSidebarProfile();
    initPWA();
    presentPendingCheckout();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initApp);
  else initApp();
})();
