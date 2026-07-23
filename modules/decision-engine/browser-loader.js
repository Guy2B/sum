'use strict';

(function exposeSigmaDecisionEngine(root) {
  if (!root.SIGMA_DECISION_ENGINE) {
    console.error(
      'Sigma Decision Engine was not loaded. Check script order in app.html.'
    );
    return;
  }

  root.SUM_DECISION_ENGINE_V6 = root.SIGMA_DECISION_ENGINE;

  root.SUM_DECISION_ENGINE_V6.fromLegacyState = function fromLegacyState(state = {}) {
    const signals = [];

    (state.mailMessages || [])
      .filter((item) => !item.handled)
      .forEach((item) => signals.push({
        id: `mail:${item.id}`,
        sourceType: 'mail',
        title: item.subject || 'Message',
        body: item.snippet || '',
        sender: item.sender || '',
        receivedAt: item.receivedAt,
        needsReply: Boolean(item.needsReply),
        important: item.importance === 'high',
        sourceUrl: item.sourceUrl || '',
        accountId: item.accountId
      }));

    (state.socialInteractions || [])
      .filter((item) => !item.handled)
      .forEach((item) => signals.push({
        id: `social:${item.id}`,
        sourceType: 'social',
        title: item.title || item.content || 'Interaction',
        body: item.content || '',
        sender: item.sender || '',
        receivedAt: item.receivedAt,
        needsReply: Boolean(item.requiresReply),
        important: Number(item.priority || 0) >= 70,
        sourceUrl: item.sourceUrl || '',
        accountId: item.accountId
      }));

    (state.tasks || [])
      .filter((item) => !item.done)
      .forEach((item) => signals.push({
        id: `task:${item.id}`,
        sourceType: 'task',
        title: item.title || 'Task',
        body: item.category || '',
        createdAt: item.createdAt,
        dueDate: item.dueDate,
        urgent: Boolean(item.urgent),
        important: item.important !== false,
        essential: Boolean(item.essential),
        estimate: Number(item.estimate || 30),
        userCreated: true
      }));

    (state.events || []).forEach((item) => signals.push({
      id: `event:${item.id}`,
      sourceType: 'event',
      title: item.title || 'Event',
      body: item.description || item.time || '',
      startAt: item.startAt || `${item.date}T${item.time || '09:00'}:00`,
      important: Boolean(item.important)
    }));

    return {
      signals,
      context: {
        primaryGoal: state.contextProfile?.primaryGoal || '',
        goals: state.goals || [],
        relationships: state.relationships || state.contacts || [],
        observations:
          state.intelligence?.feedback ||
          state.intelligenceMemory?.observations ||
          []
      }
    };
  };

  root.SUM_DECISION_ENGINE_V6.decideLegacyState = function decideLegacyState(
    state,
    options = {}
  ) {
    const payload = root.SUM_DECISION_ENGINE_V6.fromLegacyState(state);
    return root.SUM_DECISION_ENGINE_V6.decideMany(
      payload.signals,
      payload.context,
      options
    );
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
