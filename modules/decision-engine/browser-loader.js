'use strict';

(function exposeSigmaDecisionEngine(root) {
  if (!root.SIGMA_DECISION_ENGINE) {
    console.error(
      'Sigma Decision Engine was not loaded. Check script order in app.html.'
    );
    return;
  }

  const engine = root.SIGMA_DECISION_ENGINE;
  root.SUM_DECISION_ENGINE_V7 = engine;
  // Compatibility alias for existing dashboard code.
  root.SUM_DECISION_ENGINE_V6 = engine;

  function stableId(prefix, item, index) {
    return `${prefix}:${item?.id || item?.uid || item?.sourceId || index}`;
  }

  function addCollection(signals, items, sourceType, mapper) {
    if (!Array.isArray(items)) return;
    items.forEach((item, index) => {
      if (!item || item.handled || item.archived || item.dismissed) return;
      const mapped = mapper(item, index);
      if (!mapped) return;
      const signal = {
        ...mapped,
        id: mapped.id || stableId(sourceType, item, index),
        sourceType: mapped.sourceType || sourceType,
        provider: mapped.provider || item.provider || sourceType,
        sourceId: mapped.sourceId || item.id || item.uid || index,
        metadata: {
          ...(item.metadata || {}),
          ...(mapped.metadata || {})
        }
      };

      const provenance = root.SIGMA_SIGNAL_PROVENANCE;
      signals.push(
        provenance?.attach
          ? provenance.attach(signal, {
              connector: mapped.provider || item.provider || sourceType,
              provider: mapped.provider || item.provider || sourceType
            })
          : signal
      );
    });
  }

  engine.fromLegacyState = function fromLegacyState(state = {}) {
    const signals = [];

    addCollection(signals, state.mailMessages, 'mail', (item, index) => ({
      id: stableId('mail', item, index),
      title: item.subject || 'Message',
      body: item.snippet || item.body || '',
      sender: item.sender || item.from || '',
      receivedAt: item.receivedAt || item.date,
      needsReply: Boolean(item.needsReply),
      important: item.importance === 'high' || item.important === true,
      sourceUrl: item.sourceUrl || '',
      accountId: item.accountId
    }));

    addCollection(signals, state.socialInteractions, 'social', (item, index) => ({
      id: stableId('social', item, index),
      title: item.title || item.content || 'Interaction',
      body: item.content || item.snippet || '',
      sender: item.sender || item.author || '',
      receivedAt: item.receivedAt || item.createdAt,
      needsReply: Boolean(item.requiresReply || item.needsReply),
      important: Number(item.priority || 0) >= 70,
      sourceUrl: item.sourceUrl || '',
      accountId: item.accountId
    }));

    addCollection(signals, state.tasks, 'task', (item, index) => {
      if (item.done || item.completed) return null;
      return {
        id: stableId('task', item, index),
        title: item.title || 'Task',
        body: item.description || item.category || '',
        createdAt: item.createdAt,
        dueDate: item.dueDate || item.dueAt,
        urgent: Boolean(item.urgent),
        important: item.important !== false,
        essential: Boolean(item.essential),
        estimate: Number(item.estimate || item.estimatedMinutes || 30),
        userCreated: true,
        projectId: item.projectId
      };
    });

    addCollection(signals, state.events, 'event', (item, index) => ({
      id: stableId('event', item, index),
      title: item.title || 'Event',
      body: item.description || item.time || '',
      startAt: item.startAt || (
        item.date ? `${item.date}T${item.time || '09:00'}:00` : null
      ),
      important: Boolean(item.important),
      estimate: Number(item.preparationMinutes || 20)
    }));

    addCollection(
      signals,
      state.financialAlerts || state.moneyAlerts,
      'finance',
      (item, index) => ({
        id: stableId('finance', item, index),
        title: item.title || item.label || 'Financial alert',
        body: item.description || item.message || '',
        createdAt: item.createdAt || item.date,
        dueDate: item.dueDate,
        important: item.important !== false,
        urgent: Boolean(item.urgent),
        riskLevel: item.riskLevel || (item.severity === 'high' ? 'high' : 'medium'),
        amount: item.amount,
        currency: item.currency,
        estimate: Number(item.estimate || 10)
      })
    );

    addCollection(
      signals,
      state.transactions || state.moneyTransactions,
      'money',
      (item, index) => {
        if (!item.needsReview && !item.anomaly && !item.urgent) return null;
        return {
          id: stableId('money', item, index),
          title: item.title || item.merchant || 'Transaction to review',
          body: item.description || item.category || '',
          createdAt: item.createdAt || item.date,
          important: Boolean(item.anomaly || item.important),
          urgent: Boolean(item.urgent),
          riskLevel: item.anomaly ? 'high' : item.riskLevel,
          amount: item.amount,
          currency: item.currency,
          estimate: Number(item.estimate || 5)
        };
      }
    );

    addCollection(
      signals,
      state.learningItems || state.learningSignals || state.courses,
      'learning',
      (item, index) => {
        if (item.completed) return null;
        return {
          id: stableId('learning', item, index),
          title: item.title || item.name || 'Learning item',
          body: item.description || item.module || '',
          createdAt: item.createdAt,
          dueDate: item.dueDate,
          important: Boolean(item.important),
          urgent: Boolean(item.urgent),
          estimate: Number(item.estimate || item.estimatedMinutes || 25)
        };
      }
    );

    addCollection(
      signals,
      state.healthSignals || state.wellbeingSignals,
      'wellbeing',
      (item, index) => ({
        id: stableId('wellbeing', item, index),
        title: item.title || item.metric || 'Wellbeing signal',
        body: item.description || item.message || '',
        createdAt: item.createdAt || item.date,
        important: Boolean(item.important || item.needsAttention),
        urgent: Boolean(item.urgent),
        riskLevel: item.riskLevel,
        estimate: Number(item.estimate || 10)
      })
    );

    addCollection(
      signals,
      state.mobilitySignals || state.travelSignals || state.locationSignals,
      'mobility',
      (item, index) => ({
        id: stableId('mobility', item, index),
        title: item.title || item.trip || 'Mobility signal',
        body: item.description || item.message || '',
        createdAt: item.createdAt,
        dueDate: item.dueDate || item.departureAt,
        important: item.important !== false,
        urgent: Boolean(item.urgent),
        riskLevel: item.riskLevel,
        estimate: Number(item.estimate || 15)
      })
    );

    addCollection(signals, state.projects, 'project', (item, index) => {
      if (item.completed || item.archived) return null;
      if (!item.needsAttention && !item.urgent && !item.dueDate) return null;
      return {
        id: stableId('project', item, index),
        title: item.title || item.name || 'Project',
        body: item.description || item.status || '',
        createdAt: item.createdAt,
        dueDate: item.dueDate,
        important: item.important !== false,
        urgent: Boolean(item.urgent),
        estimate: Number(item.nextActionMinutes || item.estimate || 30)
      };
    });

    addCollection(signals, state.habits, 'habit', (item, index) => {
      if (item.doneToday || item.completed) return null;
      return {
        id: stableId('habit', item, index),
        title: item.title || item.name || 'Habit',
        body: item.description || '',
        createdAt: item.createdAt,
        dueDate: item.dueDate,
        important: Boolean(item.important),
        urgent: Boolean(item.urgent),
        estimate: Number(item.estimate || 10)
      };
    });

    addCollection(signals, state.signals, 'generic', (item, index) => ({
      ...item,
      id: item.id || stableId(item.sourceType || 'generic', item, index)
    }));

    const unique = [];
    const seen = new Set();
    signals.forEach((signal) => {
      if (!signal.id || seen.has(signal.id)) return;
      seen.add(signal.id);
      unique.push(signal);
    });

    return {
      signals: unique,
      context: {
        primaryGoal: state.contextProfile?.primaryGoal || '',
        goals: state.goals || [],
        relationships: state.relationships || state.contacts || [],
        observations:
          state.intelligence?.feedback ||
          state.intelligenceMemory?.observations ||
          [],
        energy:
          state.wellbeing?.energy ||
          state.health?.energy ||
          state.contextProfile?.energy ||
          null
      }
    };
  };

  engine.decideLegacyState = function decideLegacyState(state, options = {}) {
    const payload = engine.fromLegacyState(state);
    const result = engine.decideMany(
      payload.signals,
      payload.context,
      options
    );

    if (root.SIGMA_DECISION_EDITIONS?.applyResult) {
      return root.SIGMA_DECISION_EDITIONS.applyResult(
        result,
        payload.signals,
        state || {},
        options
      );
    }

    return result;
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
