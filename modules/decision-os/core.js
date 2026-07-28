'use strict';
(function initDecisionOSCore(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SIGMA_DECISION_OS_CORE = api;
})(typeof globalThis !== 'undefined' ? globalThis : window, function factory() {
  const VERSION = '1.0.0-wave15';
  const ACTION_LABELS = { reply: 'Répondre', prepare: 'Préparer', execute: 'Exécuter', review: 'Examiner', adjust: 'Ajuster', learn: 'Apprendre', ignore: 'Ignorer' };

  function clamp(value, min, max) { return Math.max(min, Math.min(max, Number(value) || 0)); }
  function text(value) { return String(value == null ? '' : value).trim(); }
  function confidencePercent(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return 0;
    return Math.round(clamp(number <= 1 ? number * 100 : number, 0, 100));
  }
  function effort(decision) { return Math.max(1, Math.round(Number(decision?.dimensions?.effortMinutes || decision?.effortMinutes || decision?.estimate || 30))); }
  function title(decision) { return text(decision?.title || decision?.subject || decision?.actionLabel || decision?.action || 'Décision à examiner'); }
  function actionLabel(decision) { return ACTION_LABELS[decision?.action] || text(decision?.action) || 'Examiner'; }
  function explanation(decision) {
    const raw = decision?.explanation;
    if (typeof raw === 'string') return raw;
    return text(raw?.summary || raw?.reasons?.[0] || raw?.message || 'Priorité calculée à partir des signaux disponibles.');
  }
  function goalNames(state) { return (state?.goals || []).filter(g => !g.done).map(g => text(g.title || g.name)).filter(Boolean); }
  function goalAlignment(decision, state) {
    const haystack = `${title(decision)} ${explanation(decision)}`.toLowerCase();
    const matches = goalNames(state).filter(goal => {
      const normalized = goal.toLowerCase();
      if (haystack.includes(normalized)) return true;
      const words = normalized.split(/\s+/).filter(word => word.length >= 4);
      const matched = words.filter(word => haystack.includes(word) || haystack.includes(word.slice(0, 4)));
      return words.length > 0 && matched.length / words.length >= 0.5;
    }).slice(0, 3);
    const explicit = Number(decision?.dimensions?.goalAlignment || decision?.goalAlignment);
    const score = Number.isFinite(explicit) ? clamp(explicit, 0, 100) : matches.length ? 85 : clamp((Number(decision?.dimensions?.impact) || 0) * 10, 0, 100);
    return { score: Math.round(score), goals: matches };
  }
  function classify(decision) {
    const haystack = `${title(decision)} ${explanation(decision)} ${decision?.sourceType || ''}`.toLowerCase();
    const opportunityTerms = ['opportun', 'partenariat', 'client', 'vente', 'invest', 'recrut', 'presse', 'lead', 'contrat'];
    const riskTerms = ['retard', 'échéance', 'urgent', 'risque', 'conflit', 'dette', 'anomal', 'overdue', 'deadline'];
    const opportunity = opportunityTerms.some(term => haystack.includes(term));
    const risk = riskTerms.some(term => haystack.includes(term)) || ['high', 'critical'].includes(decision?.priorityBand) || Number(decision?.dimensions?.costOfInaction) >= 7;
    return risk ? 'risk' : opportunity ? 'opportunity' : 'priority';
  }
  function timelineBucket(decision, now = new Date()) {
    const minutes = effort(decision);
    const due = decision?.dueDate || decision?.startAt || decision?.metadata?.dueDate;
    if (due) {
      const deltaHours = (new Date(due).getTime() - now.getTime()) / 3600000;
      if (deltaHours <= 2) return 'now';
      if (deltaHours <= 8) return 'afternoon';
      if (deltaHours <= 30) return 'tomorrow';
      return 'week';
    }
    if (decision?.priorityBand === 'critical' || Number(decision?.score) >= 80) return 'now';
    if (minutes <= 30) return 'next30';
    if (Number(decision?.score) >= 55) return 'afternoon';
    return 'week';
  }
  function trust(decision) {
    const sourceTrust = Number(decision?.audit?.sourceTrust);
    const confidence = confidencePercent(decision?.confidence);
    const provenance = decision?.provenance || decision?.audit?.provenance;
    const sources = Array.isArray(provenance?.sources) ? provenance.sources.length : provenance ? 1 : 0;
    const score = Math.round(clamp((Number.isFinite(sourceTrust) ? sourceTrust * 10 : confidence) * 0.65 + Math.min(25, sources * 8) + (decision?.rules?.length ? 10 : 0), 0, 100));
    return { score, sources, ruleCount: Array.isArray(decision?.rules) ? decision.rules.length : 0, uncertainty: 100 - confidence };
  }
  function graph(decisions, state) {
    const nodes = [], edges = [], seen = new Set();
    function addNode(id, type, label) { if (!id || seen.has(id)) return; seen.add(id); nodes.push({ id, type, label }); }
    (decisions || []).forEach(d => {
      addNode(d.id, 'decision', title(d));
      const source = `source:${d.sourceType || 'generic'}`; addNode(source, 'source', d.sourceType || 'Signal'); edges.push({ from: source, to: d.id, type: 'produces' });
      goalAlignment(d, state).goals.forEach(g => { const gid = `goal:${g}`; addNode(gid, 'goal', g); edges.push({ from: d.id, to: gid, type: 'supports' }); });
    });
    return { nodes, edges };
  }
  function enrich(decision, state, now) {
    return { ...decision, os: { title: title(decision), actionLabel: actionLabel(decision), explanation: explanation(decision), confidence: confidencePercent(decision?.confidence), effortMinutes: effort(decision), classification: classify(decision), timeline: timelineBucket(decision, now), goalAlignment: goalAlignment(decision, state), trust: trust(decision) } };
  }
  function build(result, state = {}, options = {}) {
    const decisions = (result?.today?.items?.length ? result.today.items : result?.decisions || []).map(d => enrich(d, state, options.now));
    const capacity = Number(options.capacityMinutes || state?.settings?.todayCapacityMinutes || Number(state?.settings?.todayEnergy || 4) * 45 || 180);
    const selected = decisions.slice(0, Math.max(3, Number(options.limit || 12)));
    return {
      version: VERSION,
      generatedAt: new Date(options.now || Date.now()).toISOString(),
      capacityMinutes: capacity,
      plannedMinutes: selected.reduce((sum, d) => sum + d.os.effortMinutes, 0),
      decisions: selected,
      priorities: selected.filter(d => d.os.classification === 'priority'),
      risks: selected.filter(d => d.os.classification === 'risk'),
      opportunities: selected.filter(d => d.os.classification === 'opportunity'),
      timeline: ['now','next30','afternoon','tomorrow','week'].reduce((acc, key) => { acc[key] = selected.filter(d => d.os.timeline === key); return acc; }, {}),
      graph: graph(selected, state),
      diagnostics: result?.diagnostics || {}
    };
  }
  return Object.freeze({ VERSION, confidencePercent, effort, title, actionLabel, explanation, goalAlignment, classify, timelineBucket, trust, graph, enrich, build });
});
