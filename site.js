'use strict';
(() => {
  function init() {
    const { init: initI18n, setLanguage, t, getLanguage } = window.SUM_I18N;
    initI18n();
    const selector = document.getElementById('language-select');
    selector.addEventListener('change', () => setLanguage(selector.value));

    const editionCopy = {
      en: { title: 'One engine, five dedicated editions', text: 'Choose the workspace that matches your current context. Σ Pro unlocks every edition.', open: 'Start this edition' },
      fr: { title: 'Un seul moteur, cinq éditions dédiées', text: 'Choisissez l’espace qui correspond à votre contexte actuel. Σ Pro débloque toutes les éditions.', open: 'Commencer cette édition' },
      de: { title: 'Ein System, fünf spezialisierte Editionen', text: 'Wählen Sie den Arbeitsbereich, der zu Ihrem aktuellen Kontext passt. Σ Pro schaltet alle Editionen frei.', open: 'Diese Edition starten' },
      es: { title: 'Un solo sistema, cinco ediciones dedicadas', text: 'Elige el espacio que corresponde a tu contexto actual. Σ Pro desbloquea todas las ediciones.', open: 'Empezar esta edición' }
    };

    function escapeHTML(value = '') { return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character])); }
    function renderEditions() {
      const language = getLanguage();
      const copy = editionCopy[language] || editionCopy.en;
      document.getElementById('site-editions-title').textContent = copy.title;
      document.getElementById('site-editions-copy').textContent = copy.text;
      const grid = document.getElementById('site-edition-grid');
      grid.innerHTML = window.SUM_EDITIONS.list(language).map((edition) => `<article class="edition-site-card" style="--edition-card-accent:${edition.accent}"><span class="edition-site-icon">${escapeHTML(edition.icon)}</span><h3>${escapeHTML(edition.name)}</h3><p>${escapeHTML(edition.promise)}</p><ul>${edition.templates.slice(0, 3).map((template) => `<li>${escapeHTML(template)}</li>`).join('')}</ul><a class="button secondary full" href="app.html?edition=${edition.key}">${escapeHTML(copy.open)}</a></article>`).join('');
    }
    renderEditions();
    document.addEventListener('languagechange', renderEditions);

    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('service-worker.js').catch(() => {});
    document.querySelectorAll('[data-checkout]').forEach((button) => button.addEventListener('click', () => {
      const period = button.dataset.checkout === 'monthly' ? 'monthly' : 'annual';
      const url = period === 'monthly' ? window.SUM_CONFIG.monthlyCheckoutUrl : window.SUM_CONFIG.annualCheckoutUrl;
      if (url) return window.open(url, '_blank', 'noopener,noreferrer');
      const local = location.protocol === 'file:' || ['localhost', '127.0.0.1'].includes(location.hostname);
      if (local && window.SUM_CONFIG.allowCheckoutSimulationOnLocalhost) {
        location.href = `app.html?checkout=${encodeURIComponent(period)}`;
        return;
      }
      const toast = document.getElementById('site-toast');
      toast.textContent = t('upgrade.notConfigured');
      toast.classList.add('show');
      window.setTimeout(() => toast.classList.remove('show'), 3500);
    }));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
