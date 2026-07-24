'use strict';

(function initEditionDecisionProfiles(root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SIGMA_DECISION_EDITIONS = api;
})(typeof globalThis !== 'undefined' ? globalThis : window, function factory(root) {
  const profiles = new Map();

  const WORDS = {
    academic: [
      'exam', 'examen', 'course', 'cours', 'assignment', 'devoir',
      'revision', 'révision', 'study', 'étude', 'university', 'université',
      'thesis', 'mémoire', 'dissertation', 'scholarship', 'bourse',
      'professor', 'professeur', 'school', 'école', 'class', 'classe'
    ],
    client: [
      'client', 'customer', 'prospect', 'lead', 'devis', 'quote',
      'proposal', 'proposition', 'contract', 'contrat', 'mission'
    ],
    money: [
      'invoice', 'facture', 'payment', 'paiement', 'cashflow',
      'trésorerie', 'revenue', 'revenu', 'expense', 'dépense',
      'tax', 'impôt', 'vat', 'tva', 'bank', 'banque'
    ],
    sales: [
      'sale', 'sales', 'vente', 'commercial', 'prospection',
      'launch', 'lancement', 'offer', 'offre', 'conversion'
    ],
    creator: [
      'content', 'contenu', 'publish', 'publier', 'publication',
      'newsletter', 'podcast', 'video', 'vidéo', 'youtube',
      'sponsor', 'audience', 'subscriber', 'abonné', 'episode',
      'épisode', 'record', 'enregistrer', 'edit', 'montage'
    ],
    personal: [
      'family', 'famille', 'home', 'maison', 'household', 'foyer',
      'personal', 'personnel', 'appointment', 'rendez-vous',
      'document', 'budget', 'habit', 'habitude'
    ],
    wellbeing: [
      'health', 'santé', 'energy', 'énergie', 'sleep', 'sommeil',
      'rest', 'repos', 'walk', 'marche', 'stress', 'wellbeing',
      'bien-être'
    ],
    mobility: [
      'travel', 'voyage', 'trip', 'déplacement', 'flight', 'vol',
      'train', 'visa', 'passport', 'passeport', 'residence',
      'résidence', 'insurance', 'assurance', 'accommodation',
      'logement', 'hotel', 'hôtel', 'currency', 'devise',
      'border', 'frontière', 'embassy', 'ambassade'
    ],
    language: [
      'language', 'langue', 'english', 'anglais', 'french',
      'français', 'german', 'allemand', 'spanish', 'espagnol',
      'portuguese', 'portugais'
    ],
    deadline: [
      'deadline', 'échéance', 'due', 'urgent', 'urgente',
      'tomorrow', 'demain', 'today', "aujourd'hui", 'overdue',
      'retard'
    ],
    administration: [
      'administrative', 'administratif', 'document', 'form',
      'formulaire', 'renewal', 'renouvellement', 'registration',
      'inscription', 'compliance', 'conformité'
    ]
  };

  function normalizeText(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  function containsWord(text, word) {
    return normalizeText(text).includes(normalizeText(word));
  }

  function inferTags(signal = {}) {
    const text = [
      signal.title,
      signal.subject,
      signal.body,
      signal.snippet,
      signal.sender,
      signal.category,
      signal.socialType,
      signal.sourceType
    ].filter(Boolean).join(' ');

    const tags = new Set(
      Array.isArray(signal.tags) ? signal.tags.map(normalizeText) : []
    );

    for (const [tag, words] of Object.entries(WORDS)) {
      if (words.some((word) => containsWord(text, word))) tags.add(tag);
    }

    if (signal.sourceType === 'task') tags.add('task');
    if (signal.sourceType === 'event') tags.add('calendar');
    if (signal.sourceType === 'mail') tags.add('communication');
    if (signal.sourceType === 'social') tags.add('social');
    if (signal.needsReply) tags.add('reply');
    if (signal.dueDate || signal.dueAt) tags.add('deadline');

    return [...tags];
  }

  function profile(definition) {
    return {
      boosts: {},
      penalties: {},
      sourceBoosts: {},
      intentBoosts: {},
      suppressTags: [],
      preferredTags: [],
      ...definition
    };
  }

  const BUILT_INS = {
    student: profile({
      key: 'student',
      label: 'Σ Student',
      preferredTags: ['academic', 'deadline', 'task', 'calendar', 'wellbeing'],
      boosts: {
        academic: 24,
        deadline: 12,
        wellbeing: 7,
        language: 6
      },
      sourceBoosts: {
        task: 8,
        event: 7
      },
      intentBoosts: {
        request: 5,
        information: 2
      },
      penalties: {
        client: -18,
        sales: -24,
        money: -10,
        creator: -8
      }
    }),

    solo: profile({
      key: 'solo',
      label: 'Σ Solo & Micro',
      preferredTags: [
        'client', 'money', 'sales', 'deadline',
        'administration', 'reply', 'task'
      ],
      boosts: {
        client: 22,
        money: 20,
        sales: 15,
        deadline: 13,
        administration: 9,
        reply: 8
      },
      sourceBoosts: {
        mail: 5,
        task: 5,
        event: 4
      },
      intentBoosts: {
        opportunity: 12,
        transactional: 10,
        request: 7
      },
      penalties: {
        academic: -18,
        creator: -5,
        social: -7
      }
    }),

    creator: profile({
      key: 'creator',
      label: 'Σ Creator',
      preferredTags: [
        'creator', 'deadline', 'sales', 'money',
        'reply', 'task', 'calendar'
      ],
      boosts: {
        creator: 23,
        deadline: 12,
        sales: 11,
        money: 8,
        reply: 7
      },
      sourceBoosts: {
        task: 7,
        event: 5,
        social: 3
      },
      intentBoosts: {
        opportunity: 10,
        request: 5
      },
      penalties: {
        academic: -13,
        mobility: -8,
        administration: -3
      }
    }),

    life: profile({
      key: 'life',
      label: 'Σ Life',
      preferredTags: [
        'personal', 'wellbeing', 'deadline',
        'administration', 'money', 'task'
      ],
      boosts: {
        personal: 18,
        wellbeing: 17,
        deadline: 10,
        administration: 8,
        money: 6
      },
      sourceBoosts: {
        task: 7,
        event: 6
      },
      intentBoosts: {
        request: 4,
        transactional: 3
      },
      penalties: {
        sales: -17,
        client: -12,
        creator: -7
      }
    }),

    nomad: profile({
      key: 'nomad',
      label: 'Σ Nomad',
      preferredTags: [
        'mobility', 'administration', 'deadline',
        'language', 'money', 'calendar'
      ],
      boosts: {
        mobility: 25,
        administration: 16,
        deadline: 13,
        language: 10,
        money: 8
      },
      sourceBoosts: {
        event: 8,
        task: 6,
        mail: 4
      },
      intentBoosts: {
        transactional: 8,
        request: 6
      },
      penalties: {
        academic: -10,
        creator: -8,
        sales: -5
      }
    })
  };

  function registerProfile(key, definition) {
    if (!key || !definition || typeof definition !== 'object') {
      throw new TypeError('Edition profile requires a key and a definition');
    }

    const normalized = normalizeEdition(key);
    profiles.set(normalized, profile({
      ...definition,
      key: normalized,
      label: definition.label || normalized
    }));

    return profiles.get(normalized);
  }

  function normalizeEdition(value) {
    const raw = normalizeText(value);
    const legacy = {
      professional: 'solo',
      personal: 'life',
      'solo-micro': 'solo',
      'solo & micro': 'solo'
    };

    if (legacy[raw]) return legacy[raw];
    if (profiles.has(raw) || BUILT_INS[raw]) return raw;

    if (root?.SUM_EDITIONS?.normalize) {
      return root.SUM_EDITIONS.normalize(raw);
    }

    return raw || 'solo';
  }

  function getProfile(value) {
    const key = normalizeEdition(value);
    return profiles.get(key) || BUILT_INS[key] || BUILT_INS.solo;
  }

  function activeEdition(state = {}, options = {}) {
    return normalizeEdition(
      options.edition ||
      options.profile ||
      state.settings?.profile ||
      state.license?.edition ||
      'solo'
    );
  }

  function clampScore(value) {
    return Math.max(0, Math.min(100, Math.round(Number(value || 0))));
  }

  function band(score) {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 45) return 'medium';
    return 'low';
  }

  function editionAdjustment(decision, signal, editionProfile) {
    const tags = inferTags(signal);
    let adjustment = 0;
    const reasons = [];

    for (const tag of tags) {
      const boost = Number(editionProfile.boosts?.[tag] || 0);
      const penalty = Number(editionProfile.penalties?.[tag] || 0);

      if (boost) {
        adjustment += boost;
        reasons.push(`${editionProfile.label}: priorité ${tag} +${boost}`);
      }

      if (penalty) {
        adjustment += penalty;
        reasons.push(`${editionProfile.label}: pertinence ${tag} ${penalty}`);
      }
    }

    adjustment += Number(
      editionProfile.sourceBoosts?.[decision.sourceType] || 0
    );

    adjustment += Number(
      editionProfile.intentBoosts?.[decision.classification?.intent] || 0
    );

    const suppress = tags.some((tag) =>
      editionProfile.suppressTags.includes(tag)
    );

    return {
      tags,
      adjustment,
      reasons: reasons.slice(0, 3),
      suppress
    };
  }

  function applyToDecision(decision, signal, editionProfile) {
    if (!decision) return decision;

    // A prior hard safety rule always remains authoritative.
    if (
      decision.action === 'ignore' ||
      decision.classification?.isPromotion
    ) {
      return {
        ...decision,
        edition: {
          key: editionProfile.key,
          label: editionProfile.label,
          adjustment: 0,
          tags: inferTags(signal),
          applied: true,
          hardRulePreserved: true
        }
      };
    }

    const editionResult =
      editionAdjustment(decision, signal, editionProfile);

    const score = editionResult.suppress
      ? 0
      : clampScore(decision.score + editionResult.adjustment);

    const explanation = {
      ...(decision.explanation || {}),
      reasons: [
        ...(editionResult.reasons || []),
        ...((decision.explanation?.reasons) || [])
      ].slice(0, 6)
    };

    return {
      ...decision,
      action: editionResult.suppress ? 'ignore' : decision.action,
      score,
      priorityBand: band(score),
      explanation,
      edition: {
        key: editionProfile.key,
        label: editionProfile.label,
        adjustment: editionResult.adjustment,
        tags: editionResult.tags,
        preferredMatch: editionResult.tags.some((tag) =>
          editionProfile.preferredTags.includes(tag)
        ),
        applied: true
      },
      audit: {
        ...(decision.audit || {}),
        editionProfile: editionProfile.key,
        editionAdjustment: editionResult.adjustment
      }
    };
  }

  function applyResult(result, signals = [], state = {}, options = {}) {
    const key = activeEdition(state, options);
    const editionProfile = getProfile(key);
    const signalById = new Map(
      signals.map((signal) => [String(signal.id), signal])
    );

    const decisions = (result?.decisions || [])
      .map((decision) =>
        applyToDecision(
          decision,
          signalById.get(String(decision.signalId)) || {},
          editionProfile
        )
      )
      .sort((left, right) =>
        right.score - left.score ||
        right.confidence - left.confidence
      );

    const capacityMinutes =
      Number(options.capacityMinutes || result?.today?.capacityMinutes || 180);

    const selectToday =
      root?.SIGMA_DECISION_ENGINE?.selectToday ||
      root?.SUM_DECISION_ENGINE_V6?.selectToday;

    const today = typeof selectToday === 'function'
      ? selectToday(decisions, capacityMinutes)
      : {
          items: decisions
            .filter((decision) =>
              decision.action !== 'ignore' &&
              decision.priorityBand !== 'low'
            )
            .slice(0, 3),
          capacityMinutes
        };

    return {
      ...result,
      decisions,
      today,
      edition: {
        key: editionProfile.key,
        label: editionProfile.label,
        profileApplied: true
      },
      diagnostics: {
        ...(result?.diagnostics || {}),
        editionProfile: editionProfile.key,
        editionAdjustedDecisions: decisions.filter(
          (decision) => decision.edition?.adjustment !== 0
        ).length
      }
    };
  }

  Object.entries(BUILT_INS).forEach(([key, value]) =>
    profiles.set(key, value)
  );

  return {
    version: '1.0.0',
    profiles,
    registerProfile,
    normalizeEdition,
    activeEdition,
    getProfile,
    inferTags,
    applyToDecision,
    applyResult
  };
});
