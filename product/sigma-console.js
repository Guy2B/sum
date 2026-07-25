import { createNavigationState } from '../modules/product/navigation-shell.js';
import { createGoal, updateGoalProgress } from '../modules/product/goal-experience.js';
import { createTask, moveTask } from '../modules/product/task-experience.js';
import { buildDailyPlan, decidePlanItem } from '../modules/product/daily-plan-experience.js';
import { createReview } from '../modules/product/review-experience.js';
import { STORAGE_KEY, serializeState, deserializeState } from '../modules/product/local-sync.js';
import { exportBackup, importBackup } from '../modules/product/portable-backup.js';

let state = deserializeState(localStorage.getItem(STORAGE_KEY));
state={ goals:[], tasks:[], reviews:[], plan:[], ...state };
const navigation=createNavigationState(location.hash.slice(1));
const $=(selector)=>document.querySelector(selector);
const $$=(selector)=>[...document.querySelectorAll(selector)];
const escapeHtml=(value)=>String(value??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const save=()=>localStorage.setItem(STORAGE_KEY,serializeState(state));
function toast(message){const node=$('#toast');node.textContent=message;node.classList.add('show');setTimeout(()=>node.classList.remove('show'),1800)}
function navigate(route){const active=navigation.navigate(route);location.hash=active;$$('.view').forEach(v=>v.classList.toggle('active',v.id===`view-${active}`));$$('[data-route]').forEach(b=>b.classList.toggle('active',b.dataset.route===active));}
function render(){
 const done=state.tasks.filter(t=>t.status==='done'); const open=state.tasks.filter(t=>t.status!=='done');
 $('#counters').innerHTML=[['Objectifs actifs',state.goals.filter(g=>g.status==='active').length],['Tâches ouvertes',open.length],['Terminées',done.length],['Revues',state.reviews.length]].map(([label,value])=>`<article class="stat"><strong>${value}</strong><span>${label}</span></article>`).join('');
 const today=(state.plan.length?state.plan:buildDailyPlan(state.tasks,5)); $('#today-count').textContent=`${today.length} élément(s)`; $('#today-list').innerHTML=today.map((t,i)=>`<div class="list-item"><span class="order">${i+1}</span><div class="grow"><strong>${escapeHtml(t.title)}</strong><div class="muted">${t.dueAt?`Échéance ${escapeHtml(t.dueAt)}`:'Sans échéance'} · Priorité ${escapeHtml(t.priority)}</div></div><button class="small-button" data-complete="${t.id}">Terminer</button></div>`).join('')||'<p class="muted">Aucune priorité. Créez une tâche pour commencer.</p>';
 $('#goals').innerHTML=state.goals.map(g=>`<article class="goal-card"><span class="eyebrow">${escapeHtml(g.status)}</span><h3>${escapeHtml(g.title)}</h3><div class="muted">${g.targetDate?`Cible : ${escapeHtml(g.targetDate)}`:'Aucune date cible'}</div><div class="progress"><span style="width:${g.progress}%"></span></div><div class="goal-actions"><button class="small-button" data-progress="${g.id}" data-value="${Math.min(100,g.progress+25)}">+25 %</button><button class="small-button" data-delete-goal="${g.id}">Supprimer</button></div></article>`).join('')||'<p class="muted">Aucun objectif pour le moment.</p>';
 $('#task-goal').innerHTML='<option value="">Sans objectif</option>'+state.goals.map(g=>`<option value="${g.id}">${escapeHtml(g.title)}</option>`).join('');
 const statuses=[['open','À faire'],['in_progress','En cours'],['done','Terminées']]; $('#task-board').innerHTML=statuses.map(([status,label])=>`<section class="task-column"><h2>${label} · ${state.tasks.filter(t=>t.status===status).length}</h2>${state.tasks.filter(t=>t.status===status).map(t=>`<article class="task-card"><span class="priority">${escapeHtml(t.priority)}</span><strong>${escapeHtml(t.title)}</strong><div class="muted">${t.dueAt||'Sans échéance'}</div><div class="task-actions">${status!=='open'?`<button class="small-button" data-move="${t.id}" data-status="open">À faire</button>`:''}${status!=='in_progress'?`<button class="small-button" data-move="${t.id}" data-status="in_progress">En cours</button>`:''}${status!=='done'?`<button class="small-button" data-move="${t.id}" data-status="done">Terminer</button>`:''}</div></article>`).join('')||'<p class="muted">Vide</p>'}</section>`).join('');
 $('#plan-list').innerHTML=state.plan.map(item=>`<div class="list-item"><span class="order">${item.order}</span><div class="grow"><strong>${escapeHtml(item.title)}</strong><div class="muted">Décision : ${escapeHtml(item.decision)}</div></div><div class="plan-actions"><button class="small-button" data-plan="${item.id}" data-decision="accepted">Accepter</button><button class="small-button" data-plan="${item.id}" data-decision="deferred">Reporter</button><button class="small-button" data-plan="${item.id}" data-decision="rejected">Rejeter</button></div></div>`).join('')||'<p class="muted">Générez un plan quotidien.</p>';
 $('#reviews').innerHTML=state.reviews.map(r=>`<article class="review-card"><span class="eyebrow">REVUE</span><h3>${new Date(r.date).toLocaleDateString('fr-FR')}</h3><p>${r.completed} tâche(s) terminée(s), ${r.remaining} restante(s).</p><div class="muted">${r.highlights.map(escapeHtml).join(' · ')||'Aucun accomplissement enregistré.'}</div></article>`).join('')||'<p class="muted">Aucune revue enregistrée.</p>';
 bindDynamic();
}
function bindDynamic(){
 $$('[data-complete]').forEach(b=>b.onclick=()=>{const i=state.tasks.findIndex(t=>t.id===b.dataset.complete);state.tasks[i]=moveTask(state.tasks[i],'done');save();render();toast('Tâche terminée');});
 $$('[data-progress]').forEach(b=>b.onclick=()=>{const i=state.goals.findIndex(g=>g.id===b.dataset.progress);state.goals[i]=updateGoalProgress(state.goals[i],b.dataset.value);save();render();});
 $$('[data-delete-goal]').forEach(b=>b.onclick=()=>{state.goals=state.goals.filter(g=>g.id!==b.dataset.deleteGoal);save();render();});
 $$('[data-move]').forEach(b=>b.onclick=()=>{const i=state.tasks.findIndex(t=>t.id===b.dataset.move);state.tasks[i]=moveTask(state.tasks[i],b.dataset.status);save();render();});
 $$('[data-plan]').forEach(b=>b.onclick=()=>{const i=state.plan.findIndex(t=>t.id===b.dataset.plan);state.plan[i]=decidePlanItem(state.plan[i],b.dataset.decision);save();render();});
}
$$('[data-route]').forEach(b=>b.onclick=()=>navigate(b.dataset.route));
$('#goal-form').onsubmit=e=>{e.preventDefault();state.goals.push(createGoal({title:$('#goal-title').value,targetDate:$('#goal-date').value}));e.target.reset();save();render();toast('Objectif créé');};
$('#task-form').onsubmit=e=>{e.preventDefault();state.tasks.push(createTask({title:$('#task-title').value,dueAt:$('#task-date').value,priority:$('#task-priority').value,goalId:$('#task-goal').value}));e.target.reset();save();render();toast('Tâche créée');};
function generate(){state.plan=buildDailyPlan(state.tasks,5);save();render();navigate('plan');toast('Plan quotidien généré');}
$('#generate-plan').onclick=generate; $('#regenerate-plan').onclick=generate;
$('#create-review').onclick=()=>{state.reviews.unshift(createReview(state));save();render();toast('Revue créée');};
$('#export-button').onclick=()=>{const blob=new Blob([exportBackup(state)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`sigma-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(url);};
$('#import-input').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{state=importBackup(await file.text());save();render();toast('Sauvegarde importée');}catch(err){toast(err.message)}};
$('#global-search').oninput=e=>{const q=e.target.value.toLowerCase();$$('.goal-card,.task-card,.list-item,.review-card').forEach(node=>node.hidden=q&&!node.textContent.toLowerCase().includes(q));};
window.addEventListener('hashchange',()=>navigate(location.hash.slice(1))); navigate(navigation.active); render();
