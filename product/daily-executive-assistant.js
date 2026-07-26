import { processUniversalInbox } from '../modules/attention/universal-inbox.mjs';
import { runDailyExecutiveAssistant } from '../modules/daily/daily-assistant.mjs';
import { replanDay } from '../modules/daily/replanning-engine.mjs';

const signals = [
  {source:'email',subject:'Entretien demain à 10 h',body:'Merci de confirmer et de préparer votre CV.'},
  {source:'email',subject:'Facture à régler aujourd’hui',body:'Échéance aujourd’hui.'},
  {source:'calendar',title:'Rendez-vous médical vendredi',body:'Préparer ordonnance et justificatif.'},
  {source:'email',subject:'Autorisation de sortie scolaire',body:'Document à signer demain.'},
  {source:'email',subject:'Réponse à envoyer au client',body:'Le client attend une confirmation.'},
];

let planResult;

function build() {
  const queue = processUniversalInbox(signals, {
    editions:['family','job-seeker','personal'],
    now:new Date().toISOString()
  });
  planResult = runDailyExecutiveAssistant({
    attentionQueue: queue,
    calendar:{
      dayStart:'08:00',dayEnd:'18:00',
      fixedEvents:[{start:'12:00',end:'13:00',title:'Déjeuner'},{start:'15:00',end:'16:00',title:'Rendez-vous'}]
    },
    capacity:{availableMinutes:600,fixedMinutes:120,energy:.8},
    context:{delegates:['famille']}
  });
  render();
}

function render() {
  const {brief,plan,mentalLoad} = planResult;
  document.querySelector('#title').textContent = brief.title;
  document.querySelector('#summary').innerHTML = [
    ['Charge mentale', mentalLoad.level],
    ['Temps planifié', `${plan.usedMinutes} min`],
    ['Temps disponible', `${plan.capacity.usableMinutes} min`],
    ['À différer', plan.deferred.length]
  ].map(([label,value])=>`<div class="metric"><span>${label}</span><b>${value}</b></div>`).join('');

  document.querySelector('#focus').innerHTML = brief.focus.map(item =>
    `<article class="card"><span class="rank">Priorité ${item.rank}</span><h3>${escapeHtml(item.title)}</h3><p class="meta">${item.minutes} min</p><p>${escapeHtml(item.reason)}</p></article>`
  ).join('');

  document.querySelector('#scheduled').innerHTML = plan.scheduled.map(card).join('');
  document.querySelector('#deferred').innerHTML = plan.deferred.map(item =>
    `<article class="card"><strong>${escapeHtml(item.title)}</strong><p class="meta">${escapeHtml(item.deferReason)}</p></article>`
  ).join('');
  bind();
}

function card(item) {
  return `<article class="card" data-id="${item.id}">
    <header><strong>${escapeHtml(item.title)}</strong><span class="rank">#${item.sequence}</span></header>
    <p class="meta">${item.estimatedMinutes} min · ${item.energy} · ${item.preferredPeriod}</p>
    <p>${escapeHtml(item.reason)}</p>
    <div class="actions"><button class="primary" data-complete>Terminer</button><button data-delay>Reporter</button></div>
  </article>`;
}

function bind() {
  document.querySelectorAll('[data-complete]').forEach(button => button.onclick = event => {
    const actionId = event.target.closest('.card').dataset.id;
    planResult.plan = replanDay(planResult.plan,{type:'complete',actionId});
    render();
  });
  document.querySelectorAll('[data-delay]').forEach(button => button.onclick = event => {
    const actionId = event.target.closest('.card').dataset.id;
    planResult.plan = replanDay(planResult.plan,{type:'delay',actionId});
    render();
  });
}

function escapeHtml(value='') {
  return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}

document.querySelector('#replan').onclick = build;
build();
