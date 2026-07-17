'use strict';
(() => {
  const supported = ['en', 'fr', 'de', 'es'];
  let current = 'en';

  function getByPath(object, path) {
    return path.split('.').reduce((value, part) => value?.[part], object);
  }

  function interpolate(text, vars = {}) {
    return String(text ?? '').replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? `{${key}}`);
  }

  function detectLanguage() {
    const stored = localStorage.getItem(window.SUM_CONFIG.languageKey);
    if (supported.includes(stored)) return stored;
    const browser = (navigator.language || 'en').slice(0, 2).toLowerCase();
    return supported.includes(browser) ? browser : 'en';
  }

  function t(key, vars) {
    const dictionaries = window.SUM_LANG || {};
    const value = getByPath(dictionaries[current], key) ?? getByPath(dictionaries.en, key) ?? key;
    return interpolate(value, vars);
  }

  function apply(root = document) {
    root.querySelectorAll('[data-i18n]').forEach((element) => {
      element.textContent = t(element.dataset.i18n);
    });
    root.querySelectorAll('[data-i18n-html]').forEach((element) => {
      element.innerHTML = t(element.dataset.i18nHtml);
    });
    root.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
      element.placeholder = t(element.dataset.i18nPlaceholder);
    });
    root.querySelectorAll('[data-i18n-title]').forEach((element) => {
      element.title = t(element.dataset.i18nTitle);
    });
    document.documentElement.lang = current;
    const selector = document.getElementById('language-select');
    if (selector) selector.value = current;
  }

  function setLanguage(language, options = {}) {
    if (!supported.includes(language)) return false;
    current = language;
    if (options.persist !== false) localStorage.setItem(window.SUM_CONFIG.languageKey, language);
    apply();
    document.dispatchEvent(new CustomEvent('languagechange', { detail: { language } }));
    return true;
  }

  function init() {
    current = detectLanguage();
    apply();
    return current;
  }

  window.SUM_I18N = { init, t, apply, setLanguage, getLanguage: () => current, supported };
})();
