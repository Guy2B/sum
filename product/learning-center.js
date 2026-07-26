import { runLearningEngine } from '../modules/learning/learning-engine.mjs';

const now = new Date();
const events = [
  {type:'decision-feedback',occurredAt:new Date(now.setHours(9)).toISOString(),context:{optionId:'schedule'},feedback:{accepted:true}},
  {type:'decision-feedback',occurredAt:new Date(now.setHours(9)).toISOString(),context:{optionId:'schedule'},feedback:{accepted:true}},
  {type:'decision-feedback',occurredAt:new Date(now.setHours(10)).toISOString(),context:{optionId:'delegate'},feedback:{accepted:false}},
  {type:'explanation-expanded',occurredAt:new Date().toISOString(),feedback:{}},
  {type:'explanation-expanded',occurredAt:new Date().toISOString(),feedback:{}},
  {type:'explanation-expanded',occurredAt:new Date().toISOString(),feedback:{}},
];

function render() {
  const result = runLearningEngine({
    events,
    predictions:[
      {confidence:.9,correct:true},
      {confidence:.8,correct:true},
      {confidence:.7,correct:false},
    ]
  });

  document.querySelector('#summary').innerHTML = [
    ['Événements',result.processedEvents],
    ['Calibration',`${result.calibration.score}%`],
    ['Style',result.profile.explanationDepth],
    ['Créneau conseillé',`${result.recommendedTimeWindow.startHour}h–${result.recommendedTimeWindow.endHour}h`],
  ].map(([label,value])=>`<article class="metric"><span>${label}</span><b>${value}</b></article>`).join('');

  document.querySelector('#preferences').innerHTML = Object.entries(result.profile.optionAffinity).map(([key,value])=>
    `<article class="preference"><strong>${key}</strong><p>Affinité : ${value}</p><div class="bar"><span style="width:${Math.max(0,Math.min(100,50+value*5))}%"></span></div></article>`
  ).join('') || '<article class="preference">Aucune préférence forte.</article>';

  document.querySelector('#calibration').innerHTML = `<strong>${result.calibration.score}%</strong><p>${result.calibration.samples} prédictions évaluées.</p><p>Erreur moyenne : ${result.calibration.meanAbsoluteError}</p>`;

  document.querySelector('#routines').innerHTML = result.routines.map(item=>
    `<article class="routine"><strong>${item.type}</strong><p>Jour ${item.weekday}, vers ${item.hour}h · ${item.occurrences} occurrences</p></article>`
  ).join('') || '<article class="routine">Pas encore assez de répétitions.</article>';
}
document.querySelector('#recompute').onclick=render;
render();
