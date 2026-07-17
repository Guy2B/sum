'use strict';
(() => {
function initPlanner(ctx) {
  const eventForm = document.getElementById('event-form');
  const habitForm = document.getElementById('habit-form');
  const goalForm = document.getElementById('goal-form');
  const calendarTitle = document.getElementById('calendar-title');
  const calendarGrid = document.getElementById('calendar-grid');
  const weekdaysRoot = document.getElementById('calendar-weekdays');
  const eventList = document.getElementById('planner-event-list');
  const habitList = document.getElementById('habit-list');
  const presetsRoot = document.getElementById('habit-presets');
  const weeklyGoals = document.getElementById('weekly-goal-list');
  const monthlyGoals = document.getElementById('monthly-goal-list');
  let viewDate = new Date();
  viewDate.setDate(1);

  function dateISO(date) {
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  }
  function languageLocale() {
    return document.documentElement.lang === 'fr' ? 'fr-FR' : document.documentElement.lang === 'de' ? 'de-DE' : document.documentElement.lang === 'es' ? 'es-ES' : 'en-GB';
  }
  function dayNames() {
    const monday = new Date(2024, 0, 1);
    return Array.from({ length: 7 }, (_, index) => new Intl.DateTimeFormat(languageLocale(), { weekday: 'short' }).format(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + index)));
  }
  function getHabitLog(habitId, date = ctx.today()) { return ctx.getState().habitLogs.find((log) => log.habitId === habitId && log.date === date); }
  function habitStreak(habitId) {
    let streak = 0; const cursor = new Date(`${ctx.today()}T12:00:00`);
    for (let index = 0; index < 365; index += 1) {
      const date = dateISO(cursor);
      if (!ctx.getState().habitLogs.some((log) => log.habitId === habitId && log.date === date && log.done)) break;
      streak += 1; cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }

  function renderCalendar() {
    calendarTitle.textContent = new Intl.DateTimeFormat(languageLocale(), { month: 'long', year: 'numeric' }).format(viewDate);
    weekdaysRoot.innerHTML = dayNames().map((day) => `<span>${ctx.escape(day)}</span>`).join('');
    const year = viewDate.getFullYear(); const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1); const offset = (firstDay.getDay() + 6) % 7;
    const start = new Date(year, month, 1 - offset);
    const events = ctx.getState().events;
    calendarGrid.innerHTML = Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index);
      const iso = dateISO(date); const dayEvents = events.filter((event) => event.date === iso);
      const isOther = date.getMonth() !== month; const isToday = iso === ctx.today();
      return `<button class="calendar-day ${isOther ? 'other-month' : ''} ${isToday ? 'today' : ''}" type="button" data-calendar-date="${iso}"><span>${date.getDate()}</span>${dayEvents.length ? `<small>${dayEvents.slice(0, 2).map((event) => `<i title="${ctx.escape(event.title)}"></i>`).join('')}${dayEvents.length > 2 ? `+${dayEvents.length - 2}` : ''}</small>` : ''}</button>`;
    }).join('');
  }

  function renderEvents() {
    const upcoming = [...ctx.getState().events].filter((event) => event.date >= ctx.today()).sort((a, b) => `${a.date}${a.time || ''}`.localeCompare(`${b.date}${b.time || ''}`)).slice(0, 8);
    eventList.innerHTML = upcoming.length ? `<h3>${ctx.t('planner.upcoming')}</h3>${upcoming.map((event) => `<article class="event-row"><div class="event-date"><strong>${new Date(`${event.date}T12:00:00`).getDate()}</strong><span>${new Intl.DateTimeFormat(languageLocale(), { month: 'short' }).format(new Date(`${event.date}T12:00:00`))}</span></div><div><strong>${ctx.escape(event.title)}</strong><small>${event.time || ctx.t('planner.allDay')} · ${ctx.escape(ctx.t(`planner.category.${event.category || 'personal'}`))}</small></div><button class="icon-button danger" type="button" data-event-delete="${event.id}">×</button></article>`).join('')}` : `<div class="empty-state compact">${ctx.t('planner.noEvents')}</div>`;
  }

  function renderHabits() {
    const habits = ctx.getState().habits; const done = habits.filter((habit) => getHabitLog(habit.id)?.done).length;
    document.getElementById('habit-completion').textContent = habits.length ? `${done}/${habits.length}` : '0/0';
    habitList.innerHTML = habits.length ? habits.map((habit) => { const checked = Boolean(getHabitLog(habit.id)?.done); const streak = habitStreak(habit.id); return `<article class="habit-row ${checked ? 'is-complete' : ''}"><button class="habit-check" type="button" data-habit-toggle="${habit.id}" aria-pressed="${checked}">${checked ? '✓' : ''}</button><div><strong>${ctx.escape(habit.name)}</strong><small>${ctx.t('planner.daysPerWeek', { count: habit.targetDays || 7 })} · ${ctx.t('planner.streak', { count: streak })}</small></div><span class="badge">${ctx.escape(ctx.t(`planner.category.${habit.category || 'personal'}`))}</span><button class="icon-button danger" type="button" data-habit-delete="${habit.id}">×</button></article>`; }).join('') : `<div class="empty-state">${ctx.t('planner.noHabits')}</div>`;

    const presets = ['water','sleep','sport','reading','meditation','deepWork'];
    presetsRoot.innerHTML = presets.map((key) => `<button type="button" data-habit-preset="${key}">${ctx.escape(ctx.t(`planner.preset.${key}`))}</button>`).join('');
  }

  function goalCard(goal) {
    return `<article class="goal-row ${goal.done ? 'is-complete' : ''}"><label class="check-control"><input type="checkbox" data-goal-toggle="${goal.id}" ${goal.done ? 'checked' : ''}><span class="checkmark"></span></label><div><strong>${ctx.escape(goal.title)}</strong><div class="goal-progress"><span style="width:${Number(goal.progress || 0)}%"></span></div><small>${Number(goal.progress || 0)}%</small></div><input type="range" min="0" max="100" value="${Number(goal.progress || 0)}" data-goal-progress="${goal.id}" aria-label="${ctx.t('common.progress')}"><button class="icon-button danger" type="button" data-goal-delete="${goal.id}">×</button></article>`;
  }
  function renderGoals() {
    const goals = ctx.getState().goals;
    const week = goals.filter((goal) => goal.period === 'week').slice(0, 5); const month = goals.filter((goal) => goal.period === 'month').slice(0, 5);
    weeklyGoals.innerHTML = week.length ? week.map(goalCard).join('') : `<div class="empty-state compact">${ctx.t('planner.noWeekGoals')}</div>`;
    monthlyGoals.innerHTML = month.length ? month.map(goalCard).join('') : `<div class="empty-state compact">${ctx.t('planner.noMonthGoals')}</div>`;
  }

  function renderSigma() {
    const habits = ctx.getState().habits; const completed = habits.filter((habit) => getHabitLog(habit.id)?.done).length;
    const upcoming = ctx.getState().events.filter((event) => event.date >= ctx.today()).sort((a, b) => a.date.localeCompare(b.date));
    const title = document.getElementById('planner-sigma-title'); const text = document.getElementById('planner-sigma-text');
    if (!habits.length && !upcoming.length) { title.textContent = ctx.t('planner.sigmaEmptyTitle'); text.textContent = ctx.t('planner.sigmaEmptyText'); return; }
    if (habits.length && completed === habits.length) { title.textContent = ctx.t('planner.sigmaStrongTitle'); text.textContent = ctx.t('planner.sigmaStrongText', { count: completed }); return; }
    if (upcoming[0]) { title.textContent = ctx.t('planner.sigmaEventTitle'); text.textContent = ctx.t('planner.sigmaEventText', { event: upcoming[0].title, date: ctx.formatDate(upcoming[0].date), done: completed, total: habits.length }); return; }
    title.textContent = ctx.t('planner.sigmaHabitTitle'); text.textContent = ctx.t('planner.sigmaHabitText', { done: completed, total: habits.length });
  }

  function render() { renderCalendar(); renderEvents(); renderHabits(); renderGoals(); renderSigma(); }

  eventForm.addEventListener('submit', (event) => {
    event.preventDefault(); const data = new FormData(eventForm); const title = String(data.get('title')).trim(); if (!title) return;
    ctx.updateState((state) => state.events.push({ id: ctx.uid(), title, date: String(data.get('date')), time: String(data.get('time')), category: String(data.get('category')), reminder: Number(data.get('reminder')), createdAt: new Date().toISOString() }));
    eventForm.reset(); eventForm.elements.date.value = ctx.today(); ctx.toast(ctx.t('planner.eventAdded'));
  });
  habitForm.addEventListener('submit', (event) => {
    event.preventDefault(); const data = new FormData(habitForm); const name = String(data.get('name')).trim(); if (!name) return;
    if (!ctx.isPro() && ctx.getState().habits.length >= (window.SUM_CONFIG.freeHabitLimit || 3)) { ctx.openUpgrade(); return; }
    ctx.updateState((state) => state.habits.push({ id: ctx.uid(), name, category: String(data.get('category')), targetDays: Number(data.get('targetDays')) || 7, createdAt: new Date().toISOString() }));
    habitForm.reset(); habitForm.elements.targetDays.value = 7; ctx.toast(ctx.t('planner.habitAdded'));
  });
  goalForm.addEventListener('submit', (event) => {
    event.preventDefault(); const data = new FormData(goalForm); const title = String(data.get('title')).trim(); const period = String(data.get('period')); if (!title) return;
    const samePeriod = ctx.getState().goals.filter((goal) => goal.period === period && !goal.done).length;
    const limit = period === 'month' ? 3 : 5;
    if (samePeriod >= limit) { ctx.toast(ctx.t('planner.goalLimit', { count: limit }), 'error'); return; }
    if (!ctx.isPro() && period === 'month') { ctx.openUpgrade(); return; }
    ctx.updateState((state) => state.goals.push({ id: ctx.uid(), title, period, progress: 0, done: false, createdAt: new Date().toISOString() }));
    goalForm.reset(); ctx.toast(ctx.t('planner.goalAdded'));
  });

  document.getElementById('calendar-prev').addEventListener('click', () => { viewDate.setMonth(viewDate.getMonth() - 1); renderCalendar(); });
  document.getElementById('calendar-next').addEventListener('click', () => { viewDate.setMonth(viewDate.getMonth() + 1); renderCalendar(); });
  calendarGrid.addEventListener('click', (event) => { const day = event.target.closest('[data-calendar-date]'); if (!day) return; eventForm.elements.date.value = day.dataset.calendarDate; eventForm.elements.title.focus(); });

  document.getElementById('panel-planner').addEventListener('click', (event) => {
    const eventDelete = event.target.closest('[data-event-delete]'); if (eventDelete) { ctx.updateState((state) => { state.events = state.events.filter((item) => item.id !== eventDelete.dataset.eventDelete); }); return; }
    const habitToggle = event.target.closest('[data-habit-toggle]'); if (habitToggle) { ctx.updateState((state) => { const existing = state.habitLogs.find((log) => log.habitId === habitToggle.dataset.habitToggle && log.date === ctx.today()); if (existing) existing.done = !existing.done; else state.habitLogs.push({ id: ctx.uid(), habitId: habitToggle.dataset.habitToggle, date: ctx.today(), done: true }); }); return; }
    const habitDelete = event.target.closest('[data-habit-delete]'); if (habitDelete) { ctx.updateState((state) => { state.habits = state.habits.filter((item) => item.id !== habitDelete.dataset.habitDelete); state.habitLogs = state.habitLogs.filter((item) => item.habitId !== habitDelete.dataset.habitDelete); }); return; }
    const preset = event.target.closest('[data-habit-preset]'); if (preset) { if (!ctx.isPro() && ctx.getState().habits.length >= (window.SUM_CONFIG.freeHabitLimit || 3)) { ctx.openUpgrade(); return; } const name = ctx.t(`planner.preset.${preset.dataset.habitPreset}`); if (ctx.getState().habits.some((habit) => habit.name === name)) return ctx.toast(ctx.t('planner.alreadyAdded')); ctx.updateState((state) => state.habits.push({ id: ctx.uid(), name, category: preset.dataset.habitPreset === 'deepWork' ? 'focus' : preset.dataset.habitPreset === 'reading' ? 'learning' : 'health', targetDays: preset.dataset.habitPreset === 'sport' ? 3 : 7, createdAt: new Date().toISOString() })); return; }
    const goalDelete = event.target.closest('[data-goal-delete]'); if (goalDelete) { ctx.updateState((state) => { state.goals = state.goals.filter((item) => item.id !== goalDelete.dataset.goalDelete); }); }
  });
  document.getElementById('panel-planner').addEventListener('change', (event) => {
    const toggle = event.target.closest('[data-goal-toggle]'); if (toggle) { ctx.updateState((state) => { const goal = state.goals.find((item) => item.id === toggle.dataset.goalToggle); if (goal) { goal.done = toggle.checked; if (goal.done) goal.progress = 100; } }); }
  });
  document.getElementById('panel-planner').addEventListener('input', (event) => {
    const range = event.target.closest('[data-goal-progress]'); if (!range) return;
    ctx.updateState((state) => { const goal = state.goals.find((item) => item.id === range.dataset.goalProgress); if (goal) { goal.progress = Number(range.value); goal.done = goal.progress === 100; } });
  });

  ctx.subscribe(render); document.addEventListener('languagechange', render); render();
  return { render };
}
window.SUM_MODULES = window.SUM_MODULES || {};
window.SUM_MODULES.initPlanner = initPlanner;
})();
