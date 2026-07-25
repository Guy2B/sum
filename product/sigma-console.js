const state = JSON.parse(localStorage.getItem('sigma-console-v1') ?? '{"goals":[],"tasks":[]}');
const save = () => localStorage.setItem('sigma-console-v1', JSON.stringify(state));
const uid = (prefix) => `${prefix}-${crypto.randomUUID()}`;
function render(){
  const open=state.tasks.filter(t=>t.status!=='done');
  document.querySelector('#counters').innerHTML=`<div class="card"><b>${state.goals.length}</b><br>Objectifs</div><div class="card"><b>${open.length}</b><br>Tâches ouvertes</div><div class="card"><b>${state.tasks.filter(t=>t.status==='done').length}</b><br>Terminées</div>`;
  document.querySelector('#goals').innerHTML=state.goals.map(g=>`<li>${g.title}${g.targetDate?` — ${g.targetDate}`:''}</li>`).join('')||'<li>Aucun objectif</li>';
  document.querySelector('#tasks').innerHTML=state.tasks.map(t=>`<li><label><input type="checkbox" data-task="${t.id}" ${t.status==='done'?'checked':''}> ${t.title}${t.dueAt?` — ${t.dueAt}`:''}</label></li>`).join('')||'<li>Aucune tâche</li>';
  document.querySelectorAll('[data-task]').forEach(el=>el.addEventListener('change',()=>{const t=state.tasks.find(x=>x.id===el.dataset.task);t.status=el.checked?'done':'open';save();render();}));
}
document.querySelector('#goal-form').addEventListener('submit',e=>{e.preventDefault();state.goals.push({id:uid('goal'),title:document.querySelector('#goal-title').value,targetDate:document.querySelector('#goal-date').value,status:'active'});e.target.reset();save();render();});
document.querySelector('#task-form').addEventListener('submit',e=>{e.preventDefault();state.tasks.push({id:uid('task'),title:document.querySelector('#task-title').value,dueAt:document.querySelector('#task-date').value,status:'open'});e.target.reset();save();render();});
render();
