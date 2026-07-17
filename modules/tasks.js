'use strict';
(() => {
function initTasks(ctx) {
  const taskForm = document.getElementById('task-form');
  const inboxForm = document.getElementById('inbox-form');
  const tabs = document.getElementById('task-view-tabs');
  const essentialRoot = document.getElementById('task-essential-list');
  const secondaryRoot = document.getElementById('task-secondary-list');
  const orderRoot = document.getElementById('task-optimal-order');
  const inboxRoot = document.getElementById('task-inbox-list');
  const kanbanRoot = document.getElementById('task-kanban');
  const matrixRoot = document.getElementById('task-matrix');
  let activeView = 'day';

  const categoryWords = {
    health: ['santé','sport','médecin','sommeil','health','gym','doctor','sleep','gesund','arzt','schlaf','salud','médico','dormir'],
    home: ['maison','courses','ménage','home','house','grocery','clean','haus','einkauf','casa','compras','limpiar'],
    admin: ['facture','impôt','papier','email','admin','invoice','tax','form','rechnung','steuer','correo','factura'],
    projects: ['projet','client','lancement','project','launch','projekt','proyecto','cliente']
  };

  function normaliseTask(task) {
    return {
      id: task.id || ctx.uid(), title: task.title || '', priority: task.priority || 'medium', dueDate: task.dueDate || '',
      done: Boolean(task.done), createdAt: task.createdAt || new Date().toISOString(), category: task.category || 'work',
      urgent: Boolean(task.urgent), important: task.important !== false, essential: Boolean(task.essential),
      estimate: Number(task.estimate) || 30, status: task.done ? 'done' : (task.status || (task.inbox ? 'inbox' : 'todo')),
      inbox: Boolean(task.inbox || task.status === 'inbox'), subtasks: Array.isArray(task.subtasks) ? task.subtasks : [], dependencies: Array.isArray(task.dependencies) ? task.dependencies : []
    };
  }

  function score(task) {
    const today = ctx.today();
    const due = task.dueDate ? Math.ceil((new Date(`${task.dueDate}T12:00:00`) - new Date(`${today}T12:00:00`)) / 86400000) : 99;
    const priority = { high: 35, medium: 20, low: 8 }[task.priority] || 20;
    return (task.urgent ? 80 : 0) + (task.important ? 55 : 0) + priority + (task.essential ? 45 : 0) + (due < 0 ? 70 : due === 0 ? 55 : due <= 2 ? 30 : 0) - Math.min(20, Number(task.estimate || 30) / 8);
  }

  function openPlannedTasks() {
    return ctx.getState().tasks.map(normaliseTask).filter((task) => !task.done && !task.inbox).sort((a, b) => score(b) - score(a));
  }

  function essentialTasks() {
    const tasks = openPlannedTasks();
    const chosen = tasks.filter((task) => task.essential).slice(0, 3);
    for (const task of tasks) {
      if (chosen.length >= 3) break;
      if (!chosen.some((item) => item.id === task.id)) chosen.push(task);
    }
    return chosen;
  }

  function categoryLabel(category) { return ctx.t(`tasks.v12.cat${String(category || 'work').charAt(0).toUpperCase()}${String(category || 'work').slice(1)}`); }
  function matrixKey(task) {
    if (task.urgent && task.important) return 'do';
    if (!task.urgent && task.important) return 'schedule';
    if (task.urgent && !task.important) return 'delegate';
    return 'eliminate';
  }

  function taskCard(task, compact = false) {
    const subtasks = task.subtasks?.length ? `<div class="subtask-summary">${task.subtasks.filter((item) => item.done).length}/${task.subtasks.length} ${ctx.t('tasks.v12.subtasks')}</div>` : '';
    return `<article class="list-item task-v12 ${task.done ? 'is-complete' : ''}" data-task-card="${task.id}">
      <label class="check-control"><input type="checkbox" data-task-toggle="${task.id}" ${task.done ? 'checked' : ''}><span class="checkmark"></span></label>
      <div class="list-item-main"><div class="list-item-title">${ctx.escape(task.title)}</div><div class="meta-row"><span class="badge priority-${task.priority}">${ctx.t(`tasks.${task.priority}`)}</span><span>${ctx.escape(categoryLabel(task.category))}</span><span>${task.estimate} min</span>${task.dueDate ? `<span>${ctx.formatDate(task.dueDate)}</span>` : ''}${task.essential ? `<span class="essential-chip">★ ${ctx.t('tasks.v12.essentialShort')}</span>` : ''}</div>${subtasks}</div>
      <div class="task-card-actions"><button class="icon-button task-star ${task.essential ? 'active' : ''}" type="button" data-task-essential="${task.id}" aria-label="${ctx.t('tasks.v12.markEssential')}">★</button>${compact ? '' : `<button class="icon-button" type="button" data-task-assist="${task.id}" data-action="estimate" title="${ctx.t('tasks.v12.estimateWithSigma')}">Σ</button>`}<button class="icon-button danger" type="button" data-task-delete="${task.id}" aria-label="${ctx.t('common.delete')}">×</button></div>
    </article>`;
  }

  function renderDay() {
    const essentials = essentialTasks();
    const essentialIds = new Set(essentials.map((task) => task.id));
    const secondary = openPlannedTasks().filter((task) => !essentialIds.has(task.id)).slice(0, 5);
    essentialRoot.innerHTML = essentials.length ? essentials.map((task) => taskCard(task, true)).join('') : `<div class="empty-state compact">${ctx.t('tasks.v12.noEssential')}</div>`;
    secondaryRoot.innerHTML = secondary.length ? secondary.map((task) => taskCard(task, true)).join('') : `<div class="empty-state compact">${ctx.t('tasks.v12.noSecondary')}</div>`;

    const energy = Number(ctx.getState().settings.todayEnergy || 7);
    const ordered = openPlannedTasks().slice(0, 8).sort((a, b) => {
      const energyPenaltyA = energy <= 4 && a.estimate > 45 ? 35 : 0;
      const energyPenaltyB = energy <= 4 && b.estimate > 45 ? 35 : 0;
      return (score(b) - energyPenaltyB) - (score(a) - energyPenaltyA);
    });
    const total = ordered.reduce((sum, task) => sum + task.estimate, 0);
    document.getElementById('task-plan-duration').textContent = ctx.t('tasks.v12.totalDuration', { minutes: total });
    orderRoot.innerHTML = ordered.length ? ordered.map((task, index) => `<div class="timeline-item"><span>${index + 1}</span><div><strong>${ctx.escape(task.title)}</strong><small>${task.estimate} min · ${ctx.escape(categoryLabel(task.category))}</small></div><button class="text-button" type="button" data-task-assist="${task.id}" data-action="breakdown">Σ ${ctx.t('tasks.v12.breakDown')}</button></div>`).join('') : `<div class="empty-state compact">${ctx.t('tasks.empty')}</div>`;
  }

  function renderInbox() {
    const inbox = ctx.getState().tasks.map(normaliseTask).filter((task) => task.inbox && !task.done);
    inboxRoot.innerHTML = inbox.length ? inbox.map((task) => `<article class="inbox-item"><div><strong>${ctx.escape(task.title)}</strong><small>${ctx.formatDateTime(task.createdAt)}</small></div><div class="button-row"><button class="button secondary small" type="button" data-inbox-process="${task.id}">${ctx.t('tasks.v12.plan')}</button><button class="icon-button danger" type="button" data-task-delete="${task.id}">×</button></div></article>`).join('') : `<div class="empty-state">${ctx.t('tasks.v12.inboxEmpty')}</div>`;
  }

  function renderKanban() {
    const columns = ['inbox', 'todo', 'doing', 'waiting', 'done'];
    const labels = { inbox: 'tasks.v12.inbox', todo: 'tasks.v12.toDo', doing: 'tasks.v12.doing', waiting: 'tasks.v12.waiting', done: 'common.done' };
    const tasks = ctx.getState().tasks.map(normaliseTask);
    kanbanRoot.innerHTML = columns.map((column, columnIndex) => {
      const items = tasks.filter((task) => (task.done ? 'done' : task.status) === column);
      return `<section class="kanban-column"><header><span>${ctx.t(labels[column])}</span><strong>${items.length}</strong></header><div>${items.length ? items.map((task) => `<article class="kanban-card"><strong>${ctx.escape(task.title)}</strong><small>${ctx.escape(categoryLabel(task.category))} · ${task.estimate} min</small><div class="kanban-actions">${columnIndex > 0 ? `<button type="button" data-task-move="${task.id}" data-direction="left">←</button>` : ''}${columnIndex < columns.length - 1 ? `<button type="button" data-task-move="${task.id}" data-direction="right">→</button>` : ''}</div></article>`).join('') : `<div class="kanban-empty">${ctx.t('common.noData')}</div>`}</div></section>`;
    }).join('');
  }

  function renderMatrix() {
    const tasks = ctx.getState().tasks.map(normaliseTask).filter((task) => !task.done && !task.inbox);
    const quadrants = [
      ['do', 'tasks.v12.doNow', 'tasks.v12.doNowHint'], ['schedule', 'tasks.v12.schedule', 'tasks.v12.scheduleHint'],
      ['delegate', 'tasks.v12.delegate', 'tasks.v12.delegateHint'], ['eliminate', 'tasks.v12.eliminate', 'tasks.v12.eliminateHint']
    ];
    matrixRoot.innerHTML = quadrants.map(([key, title, hint]) => {
      const items = tasks.filter((task) => matrixKey(task) === key);
      return `<section class="matrix-quadrant matrix-${key}"><header><div><h3>${ctx.t(title)}</h3><p>${ctx.t(hint)}</p></div><strong>${items.length}</strong></header><div>${items.length ? items.map((task) => `<button type="button" data-task-assist="${task.id}" data-action="breakdown"><span>${ctx.escape(task.title)}</span><small>${task.estimate} min</small></button>`).join('') : `<div class="empty-state compact">${ctx.t('common.noData')}</div>`}</div></section>`;
    }).join('');
  }

  function render() {
    renderDay(); renderInbox(); renderKanban(); renderMatrix();
  }

  function inferCategory(title) {
    const normal = title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    for (const [category, words] of Object.entries(categoryWords)) if (words.some((word) => normal.includes(word.normalize('NFD').replace(/[\u0300-\u036f]/g, '')))) return category;
    return 'work';
  }

  function inferEstimate(title) {
    const length = title.trim().split(/\s+/).length;
    if (/appel|call|email|mail|message|répondre|antwort|correo/i.test(title)) return 15;
    if (/rapport|présentation|proposal|website|site|analyse|analyse|bericht|presentacion/i.test(title)) return 60;
    return length > 9 ? 45 : 30;
  }

  function triageInbox() {
    const currentEssentials = ctx.getState().tasks.filter((task) => task.essential && !task.done).length;
    let essentialSlots = Math.max(0, 3 - currentEssentials);
    ctx.updateState((state) => {
      state.tasks.forEach((raw) => {
        if (!raw.inbox && raw.status !== 'inbox') return;
        const title = String(raw.title || '');
        raw.category = inferCategory(title);
        raw.estimate = inferEstimate(title);
        raw.important = !/peut-être|maybe|irgendwann|quizas|un jour/i.test(title);
        raw.urgent = /urgent|aujourd|today|heute|hoy|maintenant|now|jetzt|ahora/i.test(title);
        raw.priority = raw.urgent && raw.important ? 'high' : raw.important ? 'medium' : 'low';
        raw.essential = essentialSlots > 0 && raw.important;
        if (raw.essential) essentialSlots -= 1;
        raw.status = 'todo'; raw.inbox = false;
      });
    });
    ctx.toast(ctx.t('tasks.v12.triaged'));
  }

  function assistTask(id, action) {
    const task = ctx.getState().tasks.find((item) => item.id === id);
    if (!task) return;
    if (action === 'estimate') {
      ctx.updateState((state) => { const item = state.tasks.find((entry) => entry.id === id); if (item) item.estimate = inferEstimate(item.title); });
      ctx.toast(ctx.t('tasks.v12.estimated', { minutes: inferEstimate(task.title) }));
      return;
    }
    if (action === 'breakdown') {
      if (task.subtasks?.length) {
        document.dispatchEvent(new CustomEvent('sum:coach-prompt', { detail: { key: 'taskBreakdown', text: ctx.t('coach.prompt.taskBreakdown', { task: task.title }) } }));
        return;
      }
      const pieces = [ctx.t('tasks.v12.subtaskClarify'), ctx.t('tasks.v12.subtaskExecute'), ctx.t('tasks.v12.subtaskReview')];
      ctx.updateState((state) => { const item = state.tasks.find((entry) => entry.id === id); if (item) item.subtasks = pieces.map((text) => ({ id: ctx.uid(), text, done: false })); });
      ctx.toast(ctx.t('tasks.v12.brokenDown'));
    }
  }

  inboxForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const title = String(new FormData(inboxForm).get('title')).trim();
    if (!title) return;
    ctx.updateState((state) => state.tasks.unshift({ id: ctx.uid(), title, priority: 'medium', dueDate: '', done: false, createdAt: new Date().toISOString(), category: 'work', urgent: false, important: false, essential: false, estimate: 30, status: 'inbox', inbox: true, subtasks: [] }));
    inboxForm.reset(); ctx.toast(ctx.t('tasks.v12.captured'));
  });

  taskForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(taskForm); const title = String(data.get('title')).trim(); if (!title) return;
    ctx.updateState((state) => state.tasks.unshift({ id: ctx.uid(), title, category: String(data.get('category')), priority: String(data.get('priority')), dueDate: String(data.get('dueDate')), estimate: Number(data.get('estimate')), urgent: data.has('urgent'), important: data.has('important'), essential: data.has('essential'), done: false, status: 'todo', inbox: false, subtasks: [], dependencies: [], createdAt: new Date().toISOString() }));
    taskForm.reset(); taskForm.elements.priority.value = 'medium'; taskForm.elements.estimate.value = '30'; taskForm.elements.important.checked = true; ctx.toast(ctx.t('toast.taskAdded'));
  });

  tabs.addEventListener('click', (event) => {
    const button = event.target.closest('[data-task-view]'); if (!button) return;
    if (button.hasAttribute('data-pro-task-view') && !ctx.isPro()) { ctx.openUpgrade(); return; }
    activeView = button.dataset.taskView;
    tabs.querySelectorAll('button').forEach((item) => item.classList.toggle('active', item === button));
    document.querySelectorAll('.task-view').forEach((view) => view.classList.toggle('active', view.id === `task-view-${activeView}`));
  });

  document.getElementById('inbox-triage').addEventListener('click', triageInbox);
  document.getElementById('inbox-triage-secondary').addEventListener('click', triageInbox);
  document.getElementById('tasks-optimise').addEventListener('click', () => document.dispatchEvent(new CustomEvent('sum:coach-prompt', { detail: { key: 'tasksPrioritise' } })));

  document.getElementById('panel-tasks').addEventListener('change', (event) => {
    const toggle = event.target.closest('[data-task-toggle]'); if (!toggle) return;
    ctx.updateState((state) => { const task = state.tasks.find((item) => item.id === toggle.dataset.taskToggle); if (task) { task.done = toggle.checked; task.status = toggle.checked ? 'done' : 'todo'; } });
  });

  document.getElementById('panel-tasks').addEventListener('click', (event) => {
    const deleteButton = event.target.closest('[data-task-delete]');
    if (deleteButton) { ctx.updateState((state) => { state.tasks = state.tasks.filter((task) => task.id !== deleteButton.dataset.taskDelete); }); ctx.toast(ctx.t('toast.taskDeleted')); return; }
    const star = event.target.closest('[data-task-essential]');
    if (star) { ctx.updateState((state) => { const task = state.tasks.find((item) => item.id === star.dataset.taskEssential); if (task) task.essential = !task.essential; }); return; }
    const process = event.target.closest('[data-inbox-process]');
    if (process) { ctx.updateState((state) => { const task = state.tasks.find((item) => item.id === process.dataset.inboxProcess); if (task) { task.inbox = false; task.status = 'todo'; task.important = true; task.category = inferCategory(task.title); task.estimate = inferEstimate(task.title); } }); return; }
    const move = event.target.closest('[data-task-move]');
    if (move) { const order = ['inbox','todo','doing','waiting','done']; ctx.updateState((state) => { const task = state.tasks.find((item) => item.id === move.dataset.taskMove); if (!task) return; const current = order.indexOf(task.done ? 'done' : task.status); const next = Math.max(0, Math.min(order.length - 1, current + (move.dataset.direction === 'right' ? 1 : -1))); task.status = order[next]; task.inbox = task.status === 'inbox'; task.done = task.status === 'done'; }); return; }
    const assist = event.target.closest('[data-task-assist]'); if (assist) assistTask(assist.dataset.taskAssist, assist.dataset.action);
  });

  ctx.subscribe(render); document.addEventListener('languagechange', render); render();
  return { render, triageInbox, getEssentialTasks: essentialTasks };
}
window.SUM_MODULES = window.SUM_MODULES || {};
window.SUM_MODULES.initTasks = initTasks;
})();
