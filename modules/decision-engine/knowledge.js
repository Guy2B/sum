'use strict';

(function initKnowledge(root, factory) {
  const utils = typeof module === 'object' && module.exports
    ? require('./utils')
    : root.SIGMA_DECISION_UTILS;
  const api = factory(utils);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SIGMA_DECISION_KNOWLEDGE = api;
})(typeof globalThis !== 'undefined' ? globalThis : window, function factory(utils) {
  const PROMOTION_TERMS = [
    'reward','discount','promotion','promo','newsletter','unsubscribe',
    'survey reward','feedback reward','special offer','limited offer',
    'remise','recompense','sondage','désabonner','desabonner','offre spéciale'
  ];

  const TRANSACTIONAL_TERMS = [
    'invoice','facture','payment','paiement','contract','contrat','renewal',
    'renouvellement','deadline','échéance','echeance','overdue','en retard'
  ];

  const OPPORTUNITY_TERMS = [
    'proposal','proposition','quote','devis','pricing','tarif','budget',
    'client','prospect','partnership','partenariat','interview','entretien',
    'offer','offre','opportunity','opportunite'
  ];

  const REQUEST_TERMS = [
    'please','could you','can you','need you','action required','reply',
    'répondre','repondre','pouvez-vous','merci de','besoin de','à valider',
    'a valider','approval','approve','confirm','confirmer'
  ];

  const RELATIONSHIP_WEIGHTS = Object.freeze({
    strategic_client: 1.0,
    client: 0.88,
    active_prospect: 0.82,
    partner: 0.76,
    manager: 0.74,
    colleague: 0.58,
    candidate: 0.56,
    community: 0.42,
    unknown: 0.34,
    vendor: 0.32,
    automated: 0.10,
    marketing: 0.06
  });

  function combinedText(signal) {
    return [
      signal.title,
      signal.subject,
      signal.body,
      signal.snippet,
      signal.sender,
      signal.category,
      signal.intent
    ].filter(Boolean).join(' ');
  }

  function inferIntent(signal) {
    const text = combinedText(signal);
    if (signal.intent) return signal.intent;
    if (utils.includesAny(text, PROMOTION_TERMS)) return 'promotion';
    if (utils.includesAny(text, TRANSACTIONAL_TERMS)) return 'transactional';
    if (utils.includesAny(text, OPPORTUNITY_TERMS)) return 'opportunity';
    if (utils.includesAny(text, REQUEST_TERMS) || signal.needsReply) return 'request';
    if (signal.sourceType === 'event') return 'prepare';
    if (signal.sourceType === 'task') return 'execute';
    if (signal.sourceType === 'health') return 'capacity';
    return 'information';
  }

  function inferRelationship(signal, context = {}) {
    const explicit = signal.relationshipType || signal.relationship?.type;
    if (explicit && RELATIONSHIP_WEIGHTS[explicit] !== undefined) return explicit;

    const sender = utils.normalizeText(signal.sender || signal.email || '');
    const known = context.relationships || context.contacts || [];
    const match = known.find((entry) => {
      const email = utils.normalizeText(entry.email || '');
      const name = utils.normalizeText(entry.name || entry.displayName || '');
      return (email && sender.includes(email)) || (name && sender.includes(name));
    });

    if (match?.relationshipType && RELATIONSHIP_WEIGHTS[match.relationshipType] !== undefined) {
      return match.relationshipType;
    }

    if (signal.automated || /no-?reply|noreply|mailer|notification/.test(sender)) {
      return inferIntent(signal) === 'promotion' ? 'marketing' : 'automated';
    }

    return 'unknown';
  }

  function relationshipValue(type) {
    return RELATIONSHIP_WEIGHTS[type] ?? RELATIONSHIP_WEIGHTS.unknown;
  }

  function inferSourceTrust(signal) {
    if (signal.sourceTrust !== undefined) return utils.clamp(signal.sourceTrust, 0, 1);
    if (signal.sourceType === 'task' && signal.userCreated !== false) return 0.96;
    if (signal.sourceType === 'event') return 0.92;
    if (signal.sourceType === 'mail') return signal.sender ? 0.84 : 0.68;
    if (signal.sourceType === 'social') return 0.64;
    if (signal.sourceType === 'health') return 0.80;
    return 0.62;
  }

  function inferGoalAlignment(signal, context = {}) {
    if (Number.isFinite(Number(signal.goalAlignment))) {
      return utils.clamp(signal.goalAlignment, 0, 1);
    }
    const goals = [
      context.primaryGoal,
      ...(context.goals || []).map((goal) => goal.title || goal.name || goal)
    ].filter(Boolean);
    if (!goals.length) return 0.35;
    const text = combinedText(signal);
    return utils.clamp(
      Math.max(...goals.map((goal) => utils.similarity(text, goal))) * 2.2,
      0,
      1
    );
  }

  function inferCommercialValue(signal) {
    if (Number.isFinite(Number(signal.commercialValue))) {
      return utils.clamp(signal.commercialValue, 0, 1);
    }
    const amount = Number(
      signal.amount || signal.opportunityValue || signal.dealValue || 0
    );
    if (amount > 0) {
      return utils.clamp(Math.log10(amount + 1) / 5, 0.2, 1);
    }
    return inferIntent(signal) === 'opportunity' ? 0.55 : 0;
  }

  function buildKnowledge(signal, context = {}) {
    const intent = inferIntent(signal);
    const relationshipType = inferRelationship(signal, context);
    return {
      intent,
      relationshipType,
      relationshipValue: relationshipValue(relationshipType),
      sourceTrust: inferSourceTrust(signal),
      goalAlignment: inferGoalAlignment(signal, context),
      commercialValue: inferCommercialValue(signal),
      isPromotion: intent === 'promotion',
      isAutomated: ['automated', 'marketing'].includes(relationshipType)
    };
  }

  return {
    PROMOTION_TERMS,
    TRANSACTIONAL_TERMS,
    OPPORTUNITY_TERMS,
    REQUEST_TERMS,
    RELATIONSHIP_WEIGHTS,
    inferIntent,
    inferRelationship,
    relationshipValue,
    buildKnowledge
  };
});
