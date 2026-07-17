'use strict';
(() => {
  const STOP_WORDS = new Set(['the','and','for','with','from','your','you','une','des','les','pour','avec','dans','sur','und','der','die','das','mit','für','von','una','las','los','para','con','del']);
  const OPPORTUNITY_WORDS = ['price','pricing','quote','proposal','prospect','client','tarif','devis','offre','kunde','angebot','precio','presupuesto','cliente'];
  const ADMIN_WORDS = ['invoice','facture','bill','renewal','subscription','payment','document','assurance','vertrag','rechnung','pago','factura','renovación'];

  function words(value = '') {
    return String(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter((word) => word.length > 2 && !STOP_WORDS.has(word));
  }
  function similarity(a, b) {
    const left = new Set(words(a)); const right = new Set(words(b));
    if (!left.size || !right.size) return 0;
    let common = 0; left.forEach((word) => { if (right.has(word)) common += 1; });
    return common / Math.max(left.size, right.size);
  }
  function ageHours(value) {
    const time = new Date(value || Date.now()).getTime();
    return Number.isFinite(time) ? Math.max(0, (Date.now() - time) / 3600000) : 0;
  }
  function dueDelta(date) {
    if (!date) return 999;
    const target = new Date(`${date}T23:59:59`).getTime();
    return Math.ceil((target - Date.now()) / 86400000);
  }
  function categoryFor(text = '') {
    const value = String(text).toLowerCase();
    if (OPPORTUNITY_WORDS.some((word) => value.includes(word))) return 'opportunity';
    if (ADMIN_WORDS.some((word) => value.includes(word))) return 'admin';
    return 'communication';
  }
  function mailItems(state) {
    return (state.mailMessages || []).filter((item) => !item.handled).map((item) => {
      const text = `${item.subject || ''} ${item.snippet || ''}`;
      const age = ageHours(item.receivedAt);
      const score = Math.min(100, 45 + (item.importance === 'high' ? 30 : 0) + (item.needsReply ? 18 : 0) + (item.unread ? 5 : 0) + (age > 24 && item.needsReply ? 8 : 0));
      return { id: `mail:${item.id}`, sourceType: 'mail', sourceId: item.id, provider: item.provider || 'mail', title: item.subject || 'Message', body: item.snippet || '', sender: item.sender || '', receivedAt: item.receivedAt, score, needsReply: Boolean(item.needsReply), category: categoryFor(text), sourceUrl: item.sourceUrl || '', accountId: item.accountId };
    });
  }
  function socialItems(state) {
    return (state.socialInteractions || []).filter((item) => !item.handled).map((item) => {
      const text = `${item.title || ''} ${item.content || ''}`;
      return { id: `social:${item.id}`, sourceType: 'social', sourceId: item.id, provider: item.provider || 'social', title: item.title || item.content || 'Interaction', body: item.content || '', sender: item.sender || '', receivedAt: item.receivedAt, score: Math.min(100, Number(item.priority || 45) + (item.requiresReply ? 8 : 0)), needsReply: Boolean(item.requiresReply), category: item.contentIdea ? 'content' : categoryFor(text), sourceUrl: item.sourceUrl || '', accountId: item.accountId };
    });
  }
  function taskItems(state) {
    return (state.tasks || []).filter((item) => !item.done).map((item) => {
      const delta = dueDelta(item.dueDate);
      let score = 28 + (item.urgent ? 30 : 0) + (item.important ? 18 : 0) + (item.essential ? 15 : 0);
      if (delta < 0) score += 25; else if (delta === 0) score += 20; else if (delta <= 2) score += 12;
      return { id: `task:${item.id}`, sourceType: 'task', sourceId: item.id, provider: 'Σ', title: item.title || 'Task', body: item.category || '', receivedAt: item.createdAt || new Date().toISOString(), score: Math.min(100, score), needsReply: false, category: 'execution', dueDate: item.dueDate, estimate: Number(item.estimate || 30), sourceUrl: '' };
    });
  }
  function eventItems(state) {
    return (state.events || []).filter((item) => dueDelta(item.date) >= 0 && dueDelta(item.date) <= 2).map((item) => ({ id: `event:${item.id}`, sourceType: 'event', sourceId: item.id, provider: 'Calendar', title: item.title || 'Event', body: item.time || '', receivedAt: `${item.date}T${item.time || '09:00'}:00`, score: dueDelta(item.date) === 0 ? 72 : 58, needsReply: false, category: 'calendar', dueDate: item.date, sourceUrl: '' }));
  }
  function wellbeingItems(state) {
    const recent = [...(state.health || [])].sort((a, b) => String(b.date).localeCompare(String(a.date)))[0];
    if (!recent) return [];
    const lowEnergy = Number(recent.energy || 0) > 0 && Number(recent.energy) <= 4;
    const lowSleep = Number(recent.sleep || 0) > 0 && Number(recent.sleep) < 6.5;
    const highStress = Number(recent.stress || 0) >= 7;
    if (!lowEnergy && !lowSleep && !highStress) return [];
    return [{ id: `health:${recent.id}`, sourceType: 'health', sourceId: recent.id, provider: recent.source || 'Health', title: 'Capacity signal', body: [lowSleep ? `Sleep ${recent.sleep}h` : '', lowEnergy ? `Energy ${recent.energy}/10` : '', highStress ? `Stress ${recent.stress}/10` : ''].filter(Boolean).join(' · '), receivedAt: `${recent.date}T08:00:00`, score: 78, needsReply: false, category: 'wellbeing', sourceUrl: '' }];
  }
  function dedupe(items) {
    const result = [];
    [...items].sort((a, b) => b.score - a.score).forEach((item) => {
      const duplicate = result.find((row) => row.category === item.category && similarity(`${row.title} ${row.sender}`, `${item.title} ${item.sender}`) >= .62);
      if (duplicate) {
        duplicate.mergedSources = [...new Set([...(duplicate.mergedSources || [duplicate.provider]), item.provider])];
        duplicate.score = Math.max(duplicate.score, item.score);
        duplicate.needsReply = duplicate.needsReply || item.needsReply;
      } else result.push({ ...item, mergedSources: [item.provider] });
    });
    return result;
  }
  function attention(state) {
    return dedupe([...mailItems(state), ...socialItems(state), ...taskItems(state), ...eventItems(state), ...wellbeingItems(state)]).sort((a, b) => b.score - a.score || String(b.receivedAt).localeCompare(String(a.receivedAt)));
  }
  function profileCoverage(profile = {}) {
    const values = [profile.primaryGoal, profile.successDefinition, profile.weeklyHours, profile.energyPeak, profile.coachingTone];
    return Math.round(values.filter((value) => value !== '' && value !== null && value !== undefined).length / values.length * 100);
  }
  function sourceCoverage(state) {
    const sources = [
      (state.tasks || []).length > 0,
      (state.events || []).length > 0,
      (state.mailAccounts || []).length > 0,
      (state.socialAccounts || []).length > 0,
      (state.health || []).length > 0,
      (state.finance || []).length > 0
    ];
    return Math.round(sources.filter(Boolean).length / sources.length * 100);
  }
  function confidence(state) {
    const profile = profileCoverage(state.contextProfile);
    const sources = sourceCoverage(state);
    const feedback = Math.min(100, ((state.intelligence?.feedback || []).length || 0) * 8);
    return Math.round(profile * .4 + sources * .45 + feedback * .15);
  }
  function capacity(state) {
    const weekly = Math.max(1, Number(state.contextProfile?.weeklyHours || 20));
    const activeDays = Math.max(1, state.contextProfile?.workDays?.length || 5);
    const todayMinutes = Math.round(weekly * 60 / activeDays);
    const plannedMinutes = (state.tasks || []).filter((task) => !task.done && (task.dueDate === new Date().toISOString().slice(0, 10) || task.essential)).reduce((sum, task) => sum + Number(task.estimate || 30), 0);
    const recent = [...(state.health || [])].sort((a, b) => String(b.date).localeCompare(String(a.date)))[0];
    const energyFactor = recent?.energy ? Math.max(.45, Math.min(1.05, Number(recent.energy) / 8)) : 1;
    const adjustedMinutes = Math.round(todayMinutes * energyFactor);
    return { weeklyHours: weekly, todayMinutes, adjustedMinutes, plannedMinutes, load: Math.round(plannedMinutes / Math.max(1, adjustedMinutes) * 100), energy: recent?.energy || null, sleep: recent?.sleep || null };
  }
  function recommendationReason(item, state) {
    const goal = state.contextProfile?.primaryGoal;
    const reasons = [];
    if (item.needsReply) reasons.push('reply expected');
    if (item.score >= 85) reasons.push('high priority');
    if (item.dueDate && dueDelta(item.dueDate) <= 0) reasons.push('due now');
    if (item.category === 'opportunity') reasons.push('commercial opportunity');
    if (item.category === 'wellbeing') reasons.push('reduced capacity');
    if (goal && similarity(item.title, goal) > .18) reasons.push('linked to your main goal');
    return reasons;
  }
  function recommendations(state) {
    const rows = attention(state);
    const chosen = [];
    const used = new Set();
    for (const item of rows) {
      const bucket = item.category === 'communication' || item.category === 'opportunity' || item.category === 'admin' ? 'communication' : item.category;
      if (used.has(bucket) && chosen.length < 2) continue;
      chosen.push({ ...item, reasons: recommendationReason(item, state) });
      used.add(bucket);
      if (chosen.length === 3) break;
    }
    return chosen;
  }
  function graph(state) {
    const nodes = [];
    const edges = [];
    const addNode = (id, type, label) => { if (!nodes.some((node) => node.id === id)) nodes.push({ id, type, label }); };
    const goal = state.contextProfile?.primaryGoal;
    if (goal) addNode('goal:primary', 'goal', goal);
    (state.projects || []).forEach((project) => addNode(`project:${project.id}`, 'project', project.name));
    attention(state).slice(0, 40).forEach((item) => {
      addNode(item.id, item.sourceType, item.title);
      (state.projects || []).forEach((project) => {
        if (similarity(`${item.title} ${item.body}`, project.name) >= .25) edges.push({ from: item.id, to: `project:${project.id}`, relation: 'likely-related' });
      });
      if (goal && similarity(`${item.title} ${item.body}`, goal) >= .18) edges.push({ from: item.id, to: 'goal:primary', relation: 'supports-goal' });
    });
    return { nodes, edges };
  }

  window.SUM_INTELLIGENCE_V17 = { attention, recommendations, confidence, capacity, graph, similarity, categoryFor };
})();
