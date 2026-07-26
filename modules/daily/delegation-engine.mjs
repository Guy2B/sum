export function classifyExecutionOptions(actions = [], context = {}) {
  const delegates = new Set(context.delegates || []);
  return actions.map(action => {
    const text = `${action.title || ''} ${action.domain || ''}`.toLocaleLowerCase('fr');
    const canDelegate = action.delegable === true || (
      delegates.size > 0 && /réserver|collecter|confirmer|imprimer|classer|demander/.test(text)
    );
    const canBatch = /email|répondre|administratif|facture|message/.test(text);
    const canIgnore = action.priorityLevel === 'info' || (action.priorityScore || 0) < 15;

    return {
      ...action,
      executionOptions: {
        doNow: ['critical', 'high'].includes(action.priorityLevel),
        delegate: canDelegate,
        batch: canBatch,
        ignore: canIgnore,
      },
    };
  });
}
