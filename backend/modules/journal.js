'use strict';
(() => {
function initJournal(ctx) {
  const form = document.getElementById('journal-form');
  const list = document.getElementById('journal-list');

  function render() {
    const entries = ctx.getState().journal;
    list.innerHTML = entries.length ? entries.map((item) => `<article class="journal-entry card">
      <div class="journal-entry-head"><time>${ctx.formatDate(item.date)}</time><button class="icon-button danger" type="button" data-journal-delete="${item.id}" aria-label="${ctx.t('common.delete')}">×</button></div>
      <p>${ctx.escape(item.text).replace(/\n/g, '<br>')}</p>
      ${item.gratitude ? `<div class="gratitude-note"><span>✦</span>${ctx.escape(item.gratitude)}</div>` : ''}
    </article>`).join('') : `<div class="empty-state">${ctx.t('journal.empty')}</div>`;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const text = String(data.get('text')).trim();
    if (!text) return;
    ctx.updateState((state) => {
      state.journal.unshift({ id: ctx.uid(), date: data.get('date') || ctx.today(), text, gratitude: String(data.get('gratitude')).trim(), createdAt: new Date().toISOString() });
    });
    form.reset();
    form.elements.date.value = ctx.today();
    ctx.toast(ctx.t('toast.journalAdded'));
  });

  list.addEventListener('click', (event) => {
    const button = event.target.closest('[data-journal-delete]');
    if (!button) return;
    ctx.updateState((state) => { state.journal = state.journal.filter((item) => item.id !== button.dataset.journalDelete); });
  });

  ctx.subscribe(render);
  document.addEventListener('languagechange', render);
  render();
  return { render };
}

window.SUM_MODULES = window.SUM_MODULES || {};
window.SUM_MODULES.initJournal = initJournal;
})();
