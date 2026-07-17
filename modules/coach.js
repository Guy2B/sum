'use strict';
(() => {
  const INTENTS = ['general', 'tasks', 'projects', 'finance', 'health', 'learning', 'journal'];

  function daysBetween(dateA, dateB = new Date()) {
    const a = new Date(dateA);
    if (Number.isNaN(a.getTime())) return 0;
    return Math.floor((dateB.getTime() - a.getTime()) / 86400000);
  }

  function normalizeText(value = '') {
    return String(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function detectIntent(prompt) {
    const value = normalizeText(prompt);
    const groups = [
      ['finance', ['budget', 'argent', 'depense', 'revenu', 'epargne', 'money', 'expense', 'income', 'saving', 'geld', 'ausgabe', 'einnahme', 'sparen', 'dinero', 'gasto', 'ingreso', 'ahorro']],
      ['health', ['fatigue', 'energie', 'sommeil', 'humeur', 'stress', 'sleep', 'energy', 'mood', 'tired', 'gesundheit', 'mude', 'schlaf', 'stimmung', 'gewohnheit', 'routine', 'salud', 'cansado', 'sueno', 'animo', 'habitude', 'habit', 'habito']],
      ['projects', ['projet', 'client', 'etape', 'bloque', 'project', 'step', 'stuck', 'projekt', 'schritt', 'proyecto', 'paso']],
      ['learning', ['apprendre', 'competence', 'formation', 'learn', 'skill', 'study', 'lernen', 'fahigkeit', 'aprender', 'habilidad', 'estudiar']],
      ['journal', ['journal', 'reflexion', 'penser', 'decision', 'gratitude', 'reflection', 'think', 'denken', 'entscheidung', 'reflexion', 'pensar', 'decision']],
      ['tasks', ['tache', 'priorite', 'retard', 'faire', 'task', 'priority', 'overdue', 'todo', 'aufgabe', 'prioritat', 'tarea', 'prioridad']]
    ];
    return groups.find(([, words]) => words.some((word) => value.includes(word)))?.[0] || 'general';
  }

  function analyse(state, ctx) {
    const insights = [];
    const today = ctx.today();
    const openTasks = state.tasks.filter((task) => !task.done);
    const overdue = openTasks.filter((task) => task.dueDate && task.dueDate < today);

    if (overdue.length) {
      insights.push({ id: 'overdue', priority: 100, tone: 'warning', title: ctx.t('coach.rule.overdueTitle'), text: ctx.t('coach.rule.overdueText', { count: overdue.length }), panel: 'tasks' });
    } else if (openTasks.length > 7) {
      insights.push({ id: 'task-load', priority: 90, tone: 'warning', title: ctx.t('coach.rule.taskLoadTitle'), text: ctx.t('coach.rule.taskLoadText', { count: openTasks.length }), panel: 'tasks' });
    } else if (openTasks.length > 0 && openTasks.length <= 3) {
      insights.push({ id: 'task-good', priority: 40, tone: 'positive', title: ctx.t('coach.rule.taskGoodTitle'), text: ctx.t('coach.rule.taskGoodText', { count: openTasks.length }), panel: 'tasks' });
    }

    const stalledProject = state.projects.find((project) => {
      const steps = Array.isArray(project.steps) ? project.steps : [];
      return steps.length && !steps.some((step) => step.done) && daysBetween(project.createdAt) >= 3;
    });
    if (stalledProject) {
      insights.push({ id: 'project-idle', priority: 78, tone: 'warning', title: ctx.t('coach.rule.projectIdleTitle'), text: ctx.t('coach.rule.projectIdleText', { name: stalledProject.name }), panel: 'projects', premium: true });
    }

    const month = today.slice(0, 7);
    const monthItems = state.finance.filter((item) => item.date?.startsWith(month));
    const monthBalance = monthItems.reduce((sum, item) => sum + (item.type === 'income' ? Number(item.amount) : -Number(item.amount)), 0);
    if (monthItems.length && monthBalance < 0) {
      insights.push({ id: 'finance-negative', priority: 88, tone: 'warning', title: ctx.t('coach.rule.financeNegativeTitle'), text: ctx.t('coach.rule.financeNegativeText', { amount: ctx.currency(monthBalance) }), panel: 'finance', premium: true });
    } else if (monthItems.length && monthBalance > 0) {
      insights.push({ id: 'finance-positive', priority: 35, tone: 'positive', title: ctx.t('coach.rule.financePositiveTitle'), text: ctx.t('coach.rule.financePositiveText', { amount: ctx.currency(monthBalance) }), panel: 'finance', premium: true });
    }

    const recentHealth = [...state.health].sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 5);
    const latestHealth = recentHealth[0];
    if (latestHealth && Number(latestHealth.energy) <= 4) {
      insights.push({ id: 'low-energy', priority: 95, tone: 'warning', title: ctx.t('coach.rule.lowEnergyTitle'), text: ctx.t('coach.rule.lowEnergyText', { energy: latestHealth.energy }), panel: 'health', premium: true });
    }
    if (recentHealth.length >= 2) {
      const avgSleep = recentHealth.reduce((sum, item) => sum + Number(item.sleep || 0), 0) / recentHealth.length;
      if (avgSleep < 6.5) insights.push({ id: 'low-sleep', priority: 92, tone: 'warning', title: ctx.t('coach.rule.lowSleepTitle'), text: ctx.t('coach.rule.lowSleepText', { sleep: avgSleep.toFixed(1) }), panel: 'health', premium: true });
    }

    const lowSkill = [...state.learning].sort((a, b) => Number(a.progress) - Number(b.progress))[0];
    if (lowSkill && Number(lowSkill.progress) < 35) {
      insights.push({ id: 'learning-idle', priority: 65, tone: 'neutral', title: ctx.t('coach.rule.learningIdleTitle'), text: ctx.t('coach.rule.learningIdleText', { name: lowSkill.name, progress: lowSkill.progress }), panel: 'learning' });
    }

    const latestJournal = [...state.journal].sort((a, b) => String(b.date).localeCompare(String(a.date)))[0];
    if (!latestJournal || daysBetween(latestJournal.createdAt || latestJournal.date) > 5) {
      insights.push({ id: 'journal', priority: 45, tone: 'neutral', title: ctx.t('coach.rule.journalTitle'), text: ctx.t('coach.rule.journalText'), panel: 'journal' });
    }

    if (!state.tasks.length && !state.learning.length && !state.journal.length) {
      insights.push({ id: 'start', priority: 110, tone: 'positive', title: ctx.t('coach.rule.startTitle'), text: ctx.t('coach.rule.startText'), panel: 'tasks' });
    }

    return insights.sort((a, b) => b.priority - a.priority).slice(0, 6);
  }

  function highestPriorityTask(state) {
    const rank = { high: 0, medium: 1, low: 2 };
    return state.tasks.filter((task) => !task.done).sort((a, b) => {
      const dueA = a.dueDate || '9999-12-31';
      const dueB = b.dueDate || '9999-12-31';
      return (rank[a.priority] ?? 1) - (rank[b.priority] ?? 1) || dueA.localeCompare(dueB);
    })[0];
  }

  function monthlyFinance(state, ctx) {
    const month = ctx.today().slice(0, 7);
    const items = state.finance.filter((item) => item.date?.startsWith(month));
    const income = items.filter((item) => item.type === 'income').reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const expense = items.filter((item) => item.type === 'expense').reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const categories = items.filter((item) => item.type === 'expense').reduce((result, item) => {
      const category = item.category || ctx.t('common.category');
      result[category] = (result[category] || 0) + Number(item.amount || 0);
      return result;
    }, {});
    const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];
    return { items, income, expense, balance: income - expense, topCategory };
  }

  function recentHealth(state) {
    const entries = [...state.health].sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 7);
    if (!entries.length) return null;
    const average = (key) => entries.reduce((sum, item) => sum + Number(item[key] || 0), 0) / entries.length;
    return { entries, sleep: average('sleep'), energy: average('energy'), mood: average('mood') };
  }

  function projectSnapshot(state) {
    const projects = state.projects || [];
    const stalled = projects.filter((project) => {
      const steps = project.steps || [];
      return steps.length && !steps.some((step) => step.done) && daysBetween(project.createdAt) >= 3;
    });
    const nextProject = projects.find((project) => (project.steps || []).some((step) => !step.done)) || projects[0];
    const nextStep = nextProject?.steps?.find((step) => !step.done);
    return { projects, stalled, nextProject, nextStep };
  }

  function learningSnapshot(state) {
    const skills = state.learning || [];
    const average = skills.length ? skills.reduce((sum, item) => sum + Number(item.progress || 0), 0) / skills.length : 0;
    const lowest = [...skills].sort((a, b) => Number(a.progress) - Number(b.progress))[0];
    return { skills, average, lowest };
  }

  function lines(ctx, observation, interpretation, action, question = '') {
    const blocks = [];
    if (observation) blocks.push(`**${ctx.t('coach.observe')}**\n${observation}`);
    if (interpretation) blocks.push(`**${ctx.t('coach.interpret')}**\n${interpretation}`);
    if (action) blocks.push(`**${ctx.t('coach.action')}**\n${action}`);
    if (question) blocks.push(`**${ctx.t('coach.followUp')}**\n${question}`);
    return blocks.join('\n\n');
  }

  function answerPending(prompt, session, state, ctx) {
    const answer = String(prompt).trim();
    const slot = session.pendingSlot;
    if (!slot) return null;
    const responses = {
      taskGoal: {
        intent: 'tasks',
        text: lines(ctx, ctx.t('coach.pending.taskObserved', { answer }), ctx.t('coach.pending.taskMeaning'), ctx.t('coach.pending.taskAction', { answer }), ctx.t('coach.pending.taskQuestion')),
        suggestions: ['tasksAdd', 'tasksPrioritise']
      },
      projectGoal: {
        intent: 'projects',
        text: lines(ctx, ctx.t('coach.pending.projectObserved', { answer }), ctx.t('coach.pending.projectMeaning'), ctx.t('coach.pending.projectAction', { answer }), ctx.t('coach.pending.projectQuestion')),
        suggestions: ['projectNext', 'generalReview']
      },
      financeGoal: {
        intent: 'finance',
        text: lines(ctx, ctx.t('coach.pending.financeObserved', { answer }), ctx.t('coach.pending.financeMeaning'), ctx.t('coach.pending.financeAction'), ctx.t('coach.pending.financeQuestion')),
        suggestions: ['financeBudget', 'financeReview']
      },
      healthSignal: {
        intent: 'health',
        text: lines(ctx, ctx.t('coach.pending.healthObserved', { answer }), ctx.t('coach.pending.healthMeaning'), ctx.t('coach.pending.healthAction'), ctx.t('coach.pending.healthQuestion')),
        suggestions: ['healthEnergy', 'healthSleep']
      },
      learningGoal: {
        intent: 'learning',
        text: lines(ctx, ctx.t('coach.pending.learningObserved', { answer }), ctx.t('coach.pending.learningMeaning'), ctx.t('coach.pending.learningAction', { answer }), ctx.t('coach.pending.learningQuestion')),
        suggestions: ['learningPlan', 'learningProgress']
      },
      journalTopic: {
        intent: 'journal',
        text: lines(ctx, ctx.t('coach.pending.journalObserved', { answer }), ctx.t('coach.pending.journalMeaning'), ctx.t('coach.pending.journalAction'), ctx.t('coach.pending.journalQuestion')),
        suggestions: ['journalReflect', 'generalReview']
      },
      generalFocus: {
        intent: detectIntent(answer),
        text: lines(ctx, ctx.t('coach.pending.generalObserved', { answer }), ctx.t('coach.pending.generalMeaning'), ctx.t('coach.pending.generalAction'), ctx.t('coach.pending.generalQuestion')),
        suggestions: ['generalDay', 'tasksPrioritise']
      }
    };
    return responses[slot] || null;
  }

  function buildResponse(prompt, state, ctx) {
    const session = state.coachSession || { intent: 'general', pendingSlot: '', context: {} };
    const pending = answerPending(prompt, session, state, ctx);
    if (pending) return { ...pending, pendingSlot: '' };

    const intent = detectIntent(prompt);
    const insights = analyse(state, ctx);

    if (intent === 'tasks') {
      const open = state.tasks.filter((task) => !task.done);
      const overdue = open.filter((task) => task.dueDate && task.dueDate < ctx.today());
      const next = highestPriorityTask(state);
      if (!open.length) return { intent, pendingSlot: 'taskGoal', text: lines(ctx, ctx.t('coach.tasks.noDataObserve'), ctx.t('coach.tasks.noDataInterpret'), '', ctx.t('coach.tasks.noDataQuestion')), suggestions: ['tasksAdd'] };
      return {
        intent, pendingSlot: '', suggestions: ['tasksPrioritise', 'generalDay'],
        text: lines(ctx,
          ctx.t('coach.tasks.observe', { open: open.length, overdue: overdue.length }),
          overdue.length ? ctx.t('coach.tasks.interpretOverdue') : ctx.t('coach.tasks.interpretClear'),
          ctx.t('coach.tasks.action', { task: next?.title || open[0].title }),
          ctx.t('coach.tasks.question'))
      };
    }

    if (intent === 'projects') {
      const data = projectSnapshot(state);
      if (!data.projects.length) return { intent, pendingSlot: 'projectGoal', text: lines(ctx, ctx.t('coach.projects.noDataObserve'), ctx.t('coach.projects.noDataInterpret'), '', ctx.t('coach.projects.noDataQuestion')), suggestions: ['projectNext'] };
      return {
        intent, pendingSlot: '', suggestions: ['projectNext', 'tasksPrioritise'],
        text: lines(ctx,
          ctx.t('coach.projects.observe', { count: data.projects.length, stalled: data.stalled.length }),
          data.stalled.length ? ctx.t('coach.projects.interpretStalled') : ctx.t('coach.projects.interpretMoving'),
          data.nextStep ? ctx.t('coach.projects.actionStep', { project: data.nextProject.name, step: data.nextStep.title }) : ctx.t('coach.projects.actionDefine', { project: data.nextProject?.name || '' }),
          ctx.t('coach.projects.question'))
      };
    }

    if (intent === 'finance') {
      const data = monthlyFinance(state, ctx);
      if (!data.items.length) return { intent, pendingSlot: 'financeGoal', text: lines(ctx, ctx.t('coach.finance.noDataObserve'), ctx.t('coach.finance.noDataInterpret'), '', ctx.t('coach.finance.noDataQuestion')), suggestions: ['financeBudget'] };
      const category = data.topCategory?.[0] || ctx.t('coach.finance.none');
      return {
        intent, pendingSlot: '', suggestions: ['financeBudget', 'financeReview'],
        text: lines(ctx,
          ctx.t('coach.finance.observe', { income: ctx.currency(data.income), expense: ctx.currency(data.expense), balance: ctx.currency(data.balance), category }),
          data.balance < 0 ? ctx.t('coach.finance.interpretNegative') : ctx.t('coach.finance.interpretPositive'),
          data.topCategory ? ctx.t('coach.finance.actionCategory', { category, amount: ctx.currency(data.topCategory[1]) }) : ctx.t('coach.finance.actionRecord'),
          ctx.t('coach.finance.question'))
      };
    }

    if (intent === 'health') {
      const data = recentHealth(state);
      if (!data) return { intent, pendingSlot: 'healthSignal', text: lines(ctx, ctx.t('coach.health.noDataObserve'), ctx.t('coach.health.noDataInterpret'), '', ctx.t('coach.health.noDataQuestion')), suggestions: ['healthEnergy', 'healthSleep'] };
      const low = data.energy < 5 || data.sleep < 6.5;
      return {
        intent, pendingSlot: '', suggestions: ['healthEnergy', 'healthSleep'],
        text: lines(ctx,
          ctx.t('coach.health.observe', { count: data.entries.length, sleep: data.sleep.toFixed(1), energy: data.energy.toFixed(1), mood: data.mood.toFixed(1) }),
          low ? ctx.t('coach.health.interpretLow') : ctx.t('coach.health.interpretStable'),
          low ? ctx.t('coach.health.actionLow') : ctx.t('coach.health.actionStable'),
          ctx.t('coach.health.question'))
      };
    }

    if (intent === 'learning') {
      const data = learningSnapshot(state);
      if (!data.skills.length) return { intent, pendingSlot: 'learningGoal', text: lines(ctx, ctx.t('coach.learning.noDataObserve'), ctx.t('coach.learning.noDataInterpret'), '', ctx.t('coach.learning.noDataQuestion')), suggestions: ['learningPlan'] };
      return {
        intent, pendingSlot: '', suggestions: ['learningPlan', 'learningProgress'],
        text: lines(ctx,
          ctx.t('coach.learning.observe', { count: data.skills.length, average: Math.round(data.average), skill: data.lowest.name, progress: data.lowest.progress }),
          data.average < 40 ? ctx.t('coach.learning.interpretEarly') : ctx.t('coach.learning.interpretMoving'),
          ctx.t('coach.learning.action', { skill: data.lowest.name }),
          ctx.t('coach.learning.question'))
      };
    }

    if (intent === 'journal') {
      const entries = [...state.journal].sort((a, b) => String(b.date).localeCompare(String(a.date)));
      if (!entries.length) return { intent, pendingSlot: 'journalTopic', text: lines(ctx, ctx.t('coach.journal.noDataObserve'), ctx.t('coach.journal.noDataInterpret'), '', ctx.t('coach.journal.noDataQuestion')), suggestions: ['journalReflect'] };
      const latest = entries[0];
      return {
        intent, pendingSlot: '', suggestions: ['journalReflect', 'generalReview'],
        text: lines(ctx,
          ctx.t('coach.journal.observe', { count: entries.length, date: ctx.formatDate(latest.date) }),
          daysBetween(latest.date) > 5 ? ctx.t('coach.journal.interpretOld') : ctx.t('coach.journal.interpretRecent'),
          ctx.t('coach.journal.action'),
          ctx.t('coach.journal.question'))
      };
    }

    const top = insights[0];
    const next = highestPriorityTask(state);
    if (!top && !next) return { intent: 'general', pendingSlot: 'generalFocus', text: lines(ctx, ctx.t('coach.general.noDataObserve'), ctx.t('coach.general.noDataInterpret'), '', ctx.t('coach.general.noDataQuestion')), suggestions: ['generalDay'] };
    return {
      intent: 'general', pendingSlot: '', suggestions: ['generalDay', 'generalReview', 'tasksPrioritise'],
      text: lines(ctx,
        top ? `${top.title} — ${top.text}` : ctx.t('coach.general.observeClear'),
        ctx.t('coach.general.interpret'),
        next ? ctx.t('coach.general.actionTask', { task: next.title }) : ctx.t('coach.general.actionInsight'),
        ctx.t('coach.general.question'))
    };
  }

  function initCoach(ctx) {
    const insightsRoot = document.getElementById('coach-insights');
    const historyRoot = document.getElementById('coach-history');
    const suggestionsRoot = document.getElementById('coach-suggestions');
    const quota = document.getElementById('coach-quota');
    const form = document.getElementById('coach-form');
    const input = document.getElementById('coach-input');
    const runButton = document.getElementById('coach-run');
    const topicPicker = document.querySelector('.coach-topic-picker');

    const promptKeys = {
      general: 'coach.prompt.generalDay', tasks: 'coach.prompt.tasksPrioritise', projects: 'coach.prompt.projectNext', finance: 'coach.prompt.financeBudget', health: 'coach.prompt.healthEnergy', learning: 'coach.prompt.learningPlan', journal: 'coach.prompt.journalReflect'
    };

    function renderQuota() {
      quota.textContent = ctx.isPro() ? ctx.t('coach.proUnlimited') : `${ctx.getCoachUsage()} / ${window.SUM_CONFIG.freeCoachLimit}`;
    }

    function renderInsights() {
      const items = ctx.getState().coachInsights || [];
      insightsRoot.innerHTML = items.length ? items.map((item) => `<button class="insight-card" data-tone="${item.tone || 'neutral'}" data-insight-panel="${item.panel}" type="button">
        <div class="insight-top"><h3>${ctx.escape(item.title)}</h3><span class="insight-priority">${item.tone === 'positive' ? ctx.t('coach.positive') : item.priority >= 85 ? ctx.t('coach.high') : ctx.t('coach.medium')}</span></div>
        <p>${ctx.escape(item.text)}</p>
      </button>`).join('') : `<div class="empty-state">${ctx.t('coach.empty')}</div>`;
    }

    function markdownLite(text) {
      return ctx.escape(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
    }

    function renderHistory() {
      const entries = ctx.getState().coachHistory || [];
      historyRoot.innerHTML = entries.length ? entries.map((entry) => `<div class="message ${entry.role}"><div class="message-avatar">${entry.role === 'user' ? ctx.escape(ctx.t('coach.user').slice(0, 1)) : 'Σ'}</div><div class="message-bubble">${markdownLite(entry.text)}</div></div>`).join('') : `<div class="ai-welcome"><div class="ai-orb">Σ</div><h3>${ctx.t('coach.title')}</h3><p>${ctx.t('coach.welcome')}</p></div>`;
      historyRoot.scrollTop = historyRoot.scrollHeight;
    }

    function renderSuggestions(keys) {
      const list = Array.isArray(keys) && keys.length ? keys : ['generalDay', 'tasksPrioritise', 'financeBudget'];
      suggestionsRoot.innerHTML = list.map((key) => `<button type="button" data-coach-prompt="${key}">${ctx.escape(ctx.t(`coach.prompt.${key}`))}</button>`).join('');
    }

    function runAnalysis(options = {}) {
      if (!options.freeBrief && !ctx.consumeCoachUse()) {
        ctx.toast(ctx.t('coach.limitShort'), 'error');
        ctx.openUpgrade();
        return [];
      }
      const items = analyse(ctx.getState(), ctx);
      ctx.updateState((state) => {
        state.coachInsights = items;
        state.lastCoachRun = new Date().toISOString();
      });
      renderQuota();
      return items;
    }

    function submitPrompt(prompt) {
      const clean = String(prompt || '').trim();
      if (!clean) return;
      if (!ctx.consumeCoachUse()) {
        ctx.toast(ctx.t('coach.limitShort'), 'error');
        ctx.openUpgrade();
        return;
      }
      const result = buildResponse(clean, ctx.getState(), ctx);
      ctx.updateState((state) => {
        state.coachHistory.push({ id: ctx.uid(), role: 'user', text: clean, createdAt: new Date().toISOString() });
        state.coachHistory.push({ id: ctx.uid(), role: 'assistant', text: result.text, createdAt: new Date().toISOString(), intent: result.intent });
        state.coachInsights = analyse(state, ctx);
        state.coachSession = { intent: result.intent || 'general', pendingSlot: result.pendingSlot || '', context: { suggestions: result.suggestions || [] } };
      });
      input.value = '';
      renderSuggestions(result.suggestions);
      renderQuota();
    }

    runButton.addEventListener('click', () => runAnalysis());
    document.addEventListener('sum:coach-run', () => {
      ctx.navigate('coach');
      window.setTimeout(() => runAnalysis(), 100);
    });
    document.addEventListener('sum:coach-prompt', (event) => {
      const key = event.detail?.key || 'generalDay';
      const prompt = event.detail?.text || ctx.t(`coach.prompt.${key}`);
      ctx.navigate('coach');
      window.setTimeout(() => submitPrompt(prompt), 120);
    });

    insightsRoot.addEventListener('click', (event) => {
      const button = event.target.closest('[data-insight-panel]');
      if (button) ctx.navigate(button.dataset.insightPanel);
    });

    topicPicker.addEventListener('click', (event) => {
      const button = event.target.closest('[data-coach-topic]');
      if (!button) return;
      topicPicker.querySelectorAll('button').forEach((item) => item.classList.toggle('active', item === button));
      input.value = ctx.t(promptKeys[button.dataset.coachTopic] || promptKeys.general);
      input.focus();
    });

    suggestionsRoot.addEventListener('click', (event) => {
      const button = event.target.closest('[data-coach-prompt]');
      if (!button) return;
      submitPrompt(ctx.t(`coach.prompt.${button.dataset.coachPrompt}`));
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      submitPrompt(input.value);
    });

    ctx.subscribe(() => { renderInsights(); renderHistory(); renderQuota(); });
    document.addEventListener('languagechange', () => {
      const translated = analyse(ctx.getState(), ctx);
      ctx.updateState((state) => { state.coachInsights = translated; });
      renderSuggestions(ctx.getState().coachSession?.context?.suggestions);
      renderQuota();
    });
    renderInsights();
    renderHistory();
    renderSuggestions(ctx.getState().coachSession?.context?.suggestions);
    renderQuota();
    return { runAnalysis, analyse: () => analyse(ctx.getState(), ctx) };
  }

  window.SUM_COACH_ENGINE = { analyse, buildResponse, detectIntent };
  window.SUM_MODULES = window.SUM_MODULES || {};
  window.SUM_MODULES.initCoach = initCoach;
})();
