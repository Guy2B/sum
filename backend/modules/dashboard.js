'use strict';
(() => {
  let radarChart;

  function taskScore(task, today) {
    const due = task.dueDate ? Math.ceil((new Date(`${task.dueDate}T12:00:00`) - new Date(`${today}T12:00:00`)) / 86400000) : 99;
    return (task.urgent ? 80 : 0) + (task.important !== false ? 50 : 0) + ({ high: 35, medium: 20, low: 8 }[task.priority] || 20) + (task.essential ? 45 : 0) + (due < 0 ? 70 : due === 0 ? 55 : due <= 2 ? 25 : 0);
  }

  function calculateScores(state) {
    const taskScoreValue = state.tasks.length ? Math.round((state.tasks.filter((task) => task.done).length / state.tasks.length) * 100) : 50;
    const steps = state.projects.flatMap((project) => project.steps || []);
    const projectScore = steps.length ? Math.round((steps.filter((step) => step.done).length / steps.length) * 100) : state.projects.length ? 35 : 50;
    const healthRecent = [...state.health].sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 7);
    const healthScore = healthRecent.length ? Math.round(healthRecent.reduce((sum, entry) => sum + Math.min(100, (Number(entry.sleep || 0) / 8) * 40 + (Number(entry.mood || 0) / 4) * 30 + (Number(entry.energy || 0) / 10) * 30), 0) / healthRecent.length) : 55;
    const finance = state.finance.reduce((totals, item) => ({ ...totals, [item.type]: totals[item.type] + Number(item.amount || 0) }), { income: 0, expense: 0 });
    const financeScore = finance.income ? Math.max(10, Math.min(100, Math.round(((finance.income - finance.expense) / finance.income) * 50 + 50))) : 50;
    const learningScore = state.learning.length ? Math.round(state.learning.reduce((sum, skill) => sum + Number(skill.progress || 0), 0) / state.learning.length) : 50;
    return { healthScore, financeScore, learningScore, taskScore: taskScoreValue, projectScore };
  }

  function initDashboard(ctx) {
    const tabs = document.getElementById('dashboard-tabs');
    const energyRange = document.getElementById('dashboard-energy');

    function renderChart(scores) {
      const canvas = document.getElementById('dashboard-radar');
      if (!window.Chart || !canvas) return;
      radarChart?.destroy();
      radarChart = new window.Chart(canvas, {
        type: 'radar',
        data: { labels: [ctx.t('dashboard.healthScore'), ctx.t('dashboard.financeScore'), ctx.t('dashboard.learningScore'), ctx.t('dashboard.tasksScore'), ctx.t('dashboard.projectsScore')], datasets: [{ data: Object.values(scores), backgroundColor: 'rgba(83,112,255,.18)', borderColor: '#5370ff', pointBackgroundColor: '#5370ff', pointRadius: 3, borderWidth: 2 }] },
        options: { responsive: true, maintainAspectRatio: false, scales: { r: { suggestedMin: 0, suggestedMax: 100, ticks: { display: false, stepSize: 20 }, grid: { color: 'rgba(127,127,127,.15)' }, angleLines: { color: 'rgba(127,127,127,.15)' }, pointLabels: { font: { size: 11, weight: 600 } } } }, plugins: { legend: { display: false } } }
      });
    }

    function openTasks(state) { return state.tasks.filter((task) => !task.done && !task.inbox && task.status !== 'inbox').sort((a, b) => taskScore(b, ctx.today()) - taskScore(a, ctx.today())); }
    function essentialTasks(state) {
      const tasks = openTasks(state); const selected = tasks.filter((task) => task.essential).slice(0, 3);
      tasks.forEach((task) => { if (selected.length < 3 && !selected.some((item) => item.id === task.id)) selected.push(task); });
      return selected;
    }
    function habitDone(state, habitId) { return state.habitLogs.some((log) => log.habitId === habitId && log.date === ctx.today() && log.done); }
    function progressRow(label, value) { return `<div class="progress-row"><div><span>${ctx.escape(label)}</span><strong>${Math.round(value)}%</strong></div><div class="progress-track"><span style="width:${Math.max(0, Math.min(100, value))}%"></span></div></div>`; }

    function renderEditionKpis(state) {
      const root = document.getElementById('edition-kpi-grid');
      if (!root || !window.SUM_EDITIONS) return;
      const icons = ['◎', '◇', '↗', '✦'];
      const metrics = window.SUM_EDITIONS.metrics(state.settings.profile, state, ctx);
      root.innerHTML = metrics.map((metric, index) => `<article class="edition-kpi card"><span class="edition-kpi-icon">${icons[index]}</span><div><small>${ctx.escape(metric.label)}</small><strong>${ctx.escape(metric.value)}</strong></div></article>`).join('');
    }

    function renderDay(state) {
      const essentials = essentialTasks(state); const priority = essentials[0];
      document.getElementById('dashboard-priority-one').innerHTML = priority ? `<div class="priority-one-content"><span class="priority-number">01</span><div><h2>${ctx.escape(priority.title)}</h2><p>${priority.estimate || 30} min · ${priority.dueDate ? ctx.formatDate(priority.dueDate) : ctx.t('tasks.v12.noDeadline')}</p></div><button class="button primary small" type="button" data-panel="tasks">${ctx.t('dashboard.v12.start')}</button></div>` : `<div class="empty-state compact">${ctx.t('dashboard.v12.noPriority')}</div>`;
      document.getElementById('dashboard-essential-tasks').innerHTML = essentials.length ? essentials.map((task, index) => `<button class="mini-task" type="button" data-panel="tasks"><span>${index + 1}</span><div><strong>${ctx.escape(task.title)}</strong><small>${task.estimate || 30} min</small></div></button>`).join('') : `<div class="empty-state compact">${ctx.t('dashboard.v12.noEssential')}</div>`;
      const habits = state.habits.slice(0, 5);
      document.getElementById('dashboard-habits-today').innerHTML = habits.length ? habits.map((habit) => `<button class="habit-mini ${habitDone(state, habit.id) ? 'done' : ''}" type="button" data-dashboard-habit="${habit.id}"><span>${habitDone(state, habit.id) ? '✓' : ''}</span><strong>${ctx.escape(habit.name)}</strong></button>`).join('') : `<div class="empty-state compact">${ctx.t('dashboard.v12.noHabits')}</div>`;
      const energy = Number(state.settings.todayEnergy || [...state.health].sort((a, b) => String(b.date).localeCompare(String(a.date)))[0]?.energy || 7);
      energyRange.value = String(energy); document.getElementById('dashboard-energy-value').textContent = String(energy);

      const insights = window.SUM_COACH_ENGINE?.analyse(state, ctx) || []; const insight = insights[0];
      document.getElementById('dashboard-focus-title').textContent = priority ? ctx.t('dashboard.v12.focusTask', { task: priority.title }) : (insight?.title || ctx.t('dashboard.v12.focusEmptyTitle'));
      document.getElementById('dashboard-focus-text').textContent = priority ? ctx.t('dashboard.v12.focusTaskText', { minutes: priority.estimate || 30, energy }) : (insight?.text || ctx.t('dashboard.v12.focusEmptyText'));
    }

    function renderWeek(state) {
      const goals = state.goals.filter((goal) => goal.period === 'week' && !goal.done).slice(0, 5);
      document.getElementById('dashboard-weekly-goals').innerHTML = goals.length ? goals.map((goal) => progressRow(goal.title, goal.progress || 0)).join('') : `<div class="empty-state compact">${ctx.t('planner.noWeekGoals')}</div>`;
      const projects = state.projects.slice(0, 4);
      document.getElementById('dashboard-week-projects').innerHTML = projects.length ? projects.map((project) => { const steps = project.steps || []; const value = steps.length ? steps.filter((step) => step.done).length / steps.length * 100 : 0; return progressRow(project.name, value); }).join('') : `<div class="empty-state compact">${ctx.t('projects.empty')}</div>`;
      const max = new Date(`${ctx.today()}T12:00:00`); max.setDate(max.getDate() + 7); const maxISO = max.toISOString().slice(0, 10);
      const events = state.events.filter((event) => event.date >= ctx.today() && event.date <= maxISO).sort((a, b) => `${a.date}${a.time || ''}`.localeCompare(`${b.date}${b.time || ''}`)).slice(0, 5);
      document.getElementById('dashboard-week-events').innerHTML = events.length ? events.map((event) => `<button class="week-event" type="button" data-panel="planner"><span>${ctx.shortDate(event.date)}</span><div><strong>${ctx.escape(event.title)}</strong><small>${event.time || ctx.t('planner.allDay')}</small></div></button>`).join('') : `<div class="empty-state compact">${ctx.t('planner.noEvents')}</div>`;
      const reminders = [];
      const overdue = state.tasks.filter((task) => !task.done && task.dueDate && task.dueDate < ctx.today()); if (overdue.length) reminders.push(ctx.t('dashboard.v12.overdueReminder', { count: overdue.length }));
      const inbox = state.tasks.filter((task) => task.inbox || task.status === 'inbox'); if (inbox.length) reminders.push(ctx.t('dashboard.v12.inboxReminder', { count: inbox.length }));
      const dueEvents = events.filter((event) => { const days = Math.ceil((new Date(`${event.date}T12:00:00`) - new Date(`${ctx.today()}T12:00:00`)) / 86400000); return Number(event.reminder || 0) >= days; });
      dueEvents.forEach((event) => reminders.push(ctx.t('dashboard.v12.eventReminder', { event: event.title })));
      document.getElementById('dashboard-reminders').innerHTML = reminders.length ? reminders.slice(0, 5).map((text) => `<div class="reminder-row"><span>!</span><p>${ctx.escape(text)}</p></div>`).join('') : `<div class="empty-state compact">${ctx.t('dashboard.v12.noReminders')}</div>`;
      const completedTasks = state.tasks.filter((task) => task.done).length; const doneHabits = state.habits.filter((habit) => habitDone(state, habit.id)).length;
      document.getElementById('dashboard-week-summary-title').textContent = ctx.t('dashboard.v12.weekSummaryTitle', { tasks: completedTasks, habits: doneHabits });
      document.getElementById('dashboard-week-summary-text').textContent = overdue.length ? ctx.t('dashboard.v12.weekSummaryPressure', { count: overdue.length }) : ctx.t('dashboard.v12.weekSummaryCalm');
    }

    function renderMonth(state) {
      const goals = state.goals.filter((goal) => goal.period === 'month').slice(0, 3);
      document.getElementById('dashboard-month-goals').innerHTML = goals.length ? goals.map((goal) => progressRow(goal.title, goal.progress || 0)).join('') : `<div class="empty-state compact">${ctx.t('planner.noMonthGoals')}</div>`;
      const scores = calculateScores(state); renderChart(scores);
      const monthGoalAvg = goals.length ? goals.reduce((sum, goal) => sum + Number(goal.progress || 0), 0) / goals.length : 0;
      const habitMonthLogs = state.habitLogs.filter((log) => log.date?.startsWith(ctx.today().slice(0, 7)) && log.done).length;
      const habitTarget = Math.max(1, state.habits.length * new Date().getDate()); const habitRate = habitMonthLogs / habitTarget * 100;
      const taskMonth = state.tasks.filter((task) => String(task.createdAt || '').startsWith(ctx.today().slice(0, 7))); const taskRate = taskMonth.length ? taskMonth.filter((task) => task.done).length / taskMonth.length * 100 : scores.taskScore;
      const learningAvg = state.learning.length ? state.learning.reduce((sum, skill) => sum + Number(skill.progress || 0), 0) / state.learning.length : 0;
      document.getElementById('dashboard-month-progress').innerHTML = [
        progressRow(ctx.t('dashboard.v12.goalsIndicator'), monthGoalAvg), progressRow(ctx.t('dashboard.v12.tasksIndicator'), taskRate), progressRow(ctx.t('dashboard.v12.habitsIndicator'), habitRate), progressRow(ctx.t('dashboard.v12.learningIndicator'), learningAvg)
      ].join('');
      const areas = [[ctx.t('dashboard.v12.areaGoals'), monthGoalAvg], [ctx.t('dashboard.v12.areaTasks'), taskRate], [ctx.t('dashboard.v12.areaHabits'), habitRate], [ctx.t('dashboard.v12.areaLearning'), learningAvg], [ctx.t('dashboard.v12.areaProjects'), scores.projectScore]];
      areas.sort((a, b) => b[1] - a[1]);
      document.getElementById('dashboard-month-analysis-title').textContent = ctx.t('dashboard.v12.monthBest', { area: areas[0][0] });
      document.getElementById('dashboard-month-analysis-text').textContent = ctx.t('dashboard.v12.monthBestText', { score: Math.round(areas[0][1]), second: areas[1][0] });
    }

    function render() { const state = ctx.getState(); document.getElementById('dashboard-greeting').textContent = ctx.greeting(); renderEditionKpis(state); renderDay(state); renderWeek(state); renderMonth(state); }

    tabs.addEventListener('click', (event) => {
      const button = event.target.closest('[data-dashboard-period]'); if (!button) return;
      const period = button.dataset.dashboardPeriod;
      if (period !== 'day' && !ctx.isPro()) { ctx.openUpgrade(); return; }
      tabs.querySelectorAll('button').forEach((item) => item.classList.toggle('active', item === button));
      document.querySelectorAll('.dashboard-period').forEach((panel) => panel.classList.toggle('active', panel.id === `dashboard-period-${period}`));
      window.setTimeout(() => window.dispatchEvent(new Event('resize')), 120);
    });
    energyRange.addEventListener('input', () => { document.getElementById('dashboard-energy-value').textContent = energyRange.value; });
    energyRange.addEventListener('change', () => { ctx.updateState((state) => { state.settings.todayEnergy = Number(energyRange.value); }); ctx.toast(ctx.t('dashboard.v12.energySaved')); });
    document.getElementById('dashboard-prepare-day').addEventListener('click', () => document.dispatchEvent(new CustomEvent('sum:coach-prompt', { detail: { key: 'generalDay' } })));
    document.getElementById('panel-dashboard').addEventListener('click', (event) => {
      const habit = event.target.closest('[data-dashboard-habit]');
      if (habit) { ctx.updateState((state) => { const existing = state.habitLogs.find((log) => log.habitId === habit.dataset.dashboardHabit && log.date === ctx.today()); if (existing) existing.done = !existing.done; else state.habitLogs.push({ id: ctx.uid(), habitId: habit.dataset.dashboardHabit, date: ctx.today(), done: true }); }); return; }
      const command = event.target.closest('[data-coach-command]'); if (command) document.dispatchEvent(new CustomEvent('sum:coach-prompt', { detail: { key: command.dataset.coachCommand } }));
    });

    ctx.subscribe(render); document.addEventListener('languagechange', render); render();
    return { render };
  }

  window.SUM_MODULES = window.SUM_MODULES || {};
  window.SUM_MODULES.initDashboard = initDashboard;
})();
