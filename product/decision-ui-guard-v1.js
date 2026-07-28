'use strict';
(() => {
  if (window.__SIGMA_DECISION_UI_GUARD_V1__) return;
  window.__SIGMA_DECISION_UI_GUARD_V1__ = true;

  const CARD_SELECTOR = '#v17-today-recommendations .v17-recommendation';
  const ROOT_SELECTOR = '#v17-today-recommendations';
  const MOJIBAKE = [
    [/Ã©/g, 'é'], [/Ã¨/g, 'è'], [/Ãª/g, 'ê'], [/Ã«/g, 'ë'],
    [/Ã€/g, 'À'], [/Ã‰/g, 'É'], [/Ã /g, 'à'], [/Ã¢/g, 'â'],
    [/Ã®/g, 'î'], [/Ã¯/g, 'ï'], [/Ã´/g, 'ô'], [/Ã¶/g, 'ö'],
    [/Ã¹/g, 'ù'], [/Ã»/g, 'û'], [/Ã§/g, 'ç'], [/Å“/g, 'œ'],
    [/â€™/g, '’'], [/â€œ/g, '“'], [/â€/g, '”'], [/â€“/g, '–'],
    [/â€”/g, '—'], [/â€¦/g, '…'], [/Â·/g, '·'], [/Â/g, ''],
    [/Î£/g, 'Σ'], [/ï¿½/g, '']
  ];

  function decodeEntities(value) {
    if (!/&(?:#\d+|#x[0-9a-f]+|[a-z]+);/i.test(value)) return value;
    const area = document.createElement('textarea');
    area.innerHTML = value;
    return area.value;
  }

  function normalize(value) {
    let text = decodeEntities(String(value ?? ''));
    for (const [pattern, replacement] of MOJIBAKE) text = text.replace(pattern, replacement);
    return text;
  }

  function normalizeTree(scope = document.body) {
    if (!scope || !document.createTreeWalker) return;
    const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      const parent = node.parentElement;
      if (!parent || ['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA'].includes(parent.tagName)) continue;
      const fixed = normalize(node.nodeValue);
      if (fixed !== node.nodeValue) node.nodeValue = fixed;
    }
    scope.querySelectorAll?.('[title],[aria-label],[placeholder],[data-label]').forEach((element) => {
      ['title', 'aria-label', 'placeholder', 'data-label'].forEach((name) => {
        if (!element.hasAttribute(name)) return;
        const current = element.getAttribute(name) || '';
        const fixed = normalize(current);
        if (fixed !== current) element.setAttribute(name, fixed);
      });
    });
  }

  function enforceCards() {
    const root = document.querySelector(ROOT_SELECTOR);
    if (!root) return;
    root.classList.add('sigma-decision-grid-locked');
    root.hidden = false;
    root.removeAttribute('aria-hidden');
    root.style.removeProperty('display');
    root.style.removeProperty('visibility');
    root.style.removeProperty('opacity');
    root.style.removeProperty('height');
    root.style.removeProperty('max-height');
    root.style.removeProperty('overflow');

    const cards = [...root.querySelectorAll('.v17-recommendation')].slice(0, 3);
    cards.forEach((card, index) => {
      card.hidden = false;
      card.removeAttribute('aria-hidden');
      card.dataset.sigmaVisibleRank = String(index + 1);
      ['display', 'visibility', 'opacity', 'height', 'max-height', 'overflow', 'position', 'transform'].forEach((name) => card.style.removeProperty(name));
    });

    window.SigmaDecisionUiStatus = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      cardsInDom: root.querySelectorAll('.v17-recommendation').length,
      cardsVisible: cards.filter((card) => {
        const style = getComputedStyle(card);
        const rect = card.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) !== 0 && rect.width > 0 && rect.height > 0;
      }).length,
      labelsNormalized: true
    };
  }

  let scheduled = false;
  function reconcile() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      enforceCards();
      normalizeTree(document.body);
    });
  }

  const observer = new MutationObserver(reconcile);
  function start() {
    reconcile();
    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'hidden', 'aria-hidden', 'title', 'aria-label', 'placeholder']
    });
    window.addEventListener('hashchange', reconcile);
    window.addEventListener('sigma:decision-debug-updated', reconcile);
    window.addEventListener('sigma:state-updated', reconcile);
    setTimeout(reconcile, 250);
    setTimeout(reconcile, 1000);
    setTimeout(reconcile, 3000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
