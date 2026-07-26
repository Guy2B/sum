import { buildDecisionContext } from './decision-context.mjs';
import { generateDecisionOptions } from './option-generator.mjs';
import { estimateOutcome } from './outcome-model.mjs';
import { scoreTradeoff } from './tradeoff-engine.mjs';
import { assessDecisionSafety } from './risk-guard.mjs';
import { explainRecommendation } from './explanation-engine.mjs';
import { buildCounterfactuals } from './counterfactual-engine.mjs';
import { applyPreferenceBias } from './preference-learning.mjs';
import { createDecisionAudit } from './audit-trail.mjs';

export function runDecisionEngine(input = {}) {
  const context = buildDecisionContext(input);
  context.profile.delegates = input.profile?.delegates || [];
  const preferences = input.preferences || {};
  const options = generateDecisionOptions(context);

  const ranked = options.map(option => {
    const outcome = estimateOutcome(option, context);
    const tradeoff = scoreTradeoff(option, outcome, context);
    tradeoff.score = applyPreferenceBias(tradeoff.score, option.id, preferences);
    const safety = assessDecisionSafety(option, context);
    return { option, outcome, tradeoff, safety };
  }).sort((a, b) =>
    Number(b.safety.safe) - Number(a.safety.safe) ||
    b.tradeoff.score - a.tradeoff.score
  );

  const recommendation = ranked[0] || null;
  const explanation = explainRecommendation({ recommended: recommendation, ranked, context });
  const counterfactuals = buildCounterfactuals(ranked);
  const audit = createDecisionAudit({
    context,
    rankedOptions: ranked,
    recommendation,
    approval: recommendation?.safety?.approvalRequired ? 'pending' : 'not-required',
  });

  return {
    context,
    ranked,
    recommendation,
    explanation,
    counterfactuals,
    audit,
  };
}
