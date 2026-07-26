import { runDecisionEngine } from '../modules/decision/decision-engine.mjs';
import { updateDecisionPreferences } from '../modules/decision/preference-learning.mjs';

let preferences = {};
let result;

function compute() {
  result = runDecisionEngine({
    signal: {
      id: 'sig_demo',
      title: 'Facture importante à régler demain',
      priority: { level: 'high', confidence: 0.88 },
      deadline: new Date(Date.now() + 24 * 36e5).toISOString(),
    },
    action: {
      title: 'Vérifier puis régler la facture',
      kind: 'pay',
      priorityLevel: 'high',
      estimatedMinutes: 20,
      cost: 240,
      reversible: false,
    },
    profile: {
      editions: ['personal', 'freelancer'],
      riskTolerance: 'balanced',
      delegates: ['comptable'],
    },
    constraints: {
      budget: 500,
      approvalRequired: true,
    },
    preferences,
  });
  render();
}

function render() {
  const rec = result.recommendation;
  document.querySelector('#recommendation').innerHTML = `
    <span class="badge">Recommandation Sigma</span>
    <h2>${escapeHtml(rec.option.label)}</h2>
    <div class="score">${rec.tradeoff.score}/100</div>
    <p>${escapeHtml(result.explanation.summary)}</p>
    <p>${escapeHtml(result.explanation.whyNotAlternative)}</p>
    ${rec.safety.approvalRequired ? '<p class="warning">Validation humaine requise avant exécution.</p>' : ''}
    <div class="actions">
      <button class="primary" data-accept>Accepter</button>
      <button data-reject>Refuser</button>
    </div>`;

  document.querySelector('#options').innerHTML = result.ranked.map(item => `
    <article class="card">
      <h3>${escapeHtml(item.option.label)}</h3>
      <p>${escapeHtml(item.option.description)}</p>
      <div class="metrics">
        <div class="metric"><span>Score</span><b>${item.tradeoff.score}</b></div>
        <div class="metric"><span>Bénéfice</span><b>${item.tradeoff.components.benefit}</b></div>
        <div class="metric"><span>Risque</span><b>${item.tradeoff.components.risk}</b></div>
      </div>
      ${item.safety.blockers.length ? `<p class="warning">${escapeHtml(item.safety.blockers.join(' '))}</p>` : ''}
    </article>`).join('');

  document.querySelector('#counterfactuals').innerHTML = result.counterfactuals.map(item =>
    `<div class="counterfactual">${escapeHtml(item.statement)}</div>`).join('');

  document.querySelector('[data-accept]').onclick = () => {
    preferences = updateDecisionPreferences(preferences, {
      optionId: rec.option.id,
      accepted: true,
    });
    compute();
  };
  document.querySelector('[data-reject]').onclick = () => {
    preferences = updateDecisionPreferences(preferences, {
      optionId: rec.option.id,
      accepted: false,
    });
    compute();
  };
}

function escapeHtml(value='') {
  return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}

document.querySelector('#recompute').onclick = compute;
compute();
