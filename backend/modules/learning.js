'use strict';
(() => {
let learningChart;

function initLearning(ctx) {
  const form = document.getElementById('learning-form');
  const list = document.getElementById('learning-list');

  function renderChart(skills) {
    const canvas = document.getElementById('learning-chart');
    if (!window.Chart || !canvas) return;
    learningChart?.destroy();
    learningChart = new window.Chart(canvas, {
      type: 'doughnut',
      data: { labels: skills.length ? skills.map((skill) => skill.name) : ['—'], datasets: [{ data: skills.length ? skills.map((skill) => skill.progress) : [1], backgroundColor: ['#5370ff','#18a999','#b75cff','#ff9f43','#3aa3ff','#ef5da8'], borderWidth: 0, spacing: 3 }] },
      options: { responsive: true, maintainAspectRatio: false, cutout: '68%', plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8 } } } }
    });
  }

  function render() {
    const skills = ctx.getState().learning;
    list.innerHTML = skills.length ? skills.map((skill) => `<article class="skill-row card">
      <div class="skill-head"><div><h3>${ctx.escape(skill.name)}</h3><p>${ctx.escape(skill.target || '')}</p></div><strong>${skill.progress}%</strong></div>
      <div class="progress-track"><span style="width:${skill.progress}%"></span></div>
      <div class="skill-actions">
        <input type="range" min="0" max="100" value="${skill.progress}" data-skill-range="${skill.id}" aria-label="${ctx.t('learning.update')}">
        <button class="icon-button danger" type="button" data-skill-delete="${skill.id}" aria-label="${ctx.t('common.delete')}">×</button>
      </div>
    </article>`).join('') : `<div class="empty-state">${ctx.t('learning.empty')}</div>`;
    renderChart(skills);
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = String(data.get('name')).trim();
    if (!name) return;
    ctx.updateState((state) => { state.learning.unshift({ id: ctx.uid(), name, target: String(data.get('target')).trim(), progress: Number(data.get('progress')) }); });
    form.reset();
    form.elements.progress.value = 10;
    ctx.toast(ctx.t('toast.skillAdded'));
  });

  list.addEventListener('input', (event) => {
    const range = event.target.closest('[data-skill-range]');
    if (!range) return;
    ctx.updateState((state) => {
      const skill = state.learning.find((item) => item.id === range.dataset.skillRange);
      if (skill) skill.progress = Number(range.value);
    });
  });

  list.addEventListener('click', (event) => {
    const button = event.target.closest('[data-skill-delete]');
    if (!button) return;
    ctx.updateState((state) => { state.learning = state.learning.filter((item) => item.id !== button.dataset.skillDelete); });
  });

  const resourceForm=document.getElementById('learning-resource-form');const resourceList=document.getElementById('learning-resource-list');const resourceSkill=document.getElementById('learning-resource-skill');
  function renderResources(){const skills=ctx.getState().learning;const current=resourceSkill?.value; if(resourceSkill){resourceSkill.innerHTML=`<option value="">${ctx.t('learning.unlinked')}</option>`+skills.map(s=>`<option value="${s.id}">${ctx.escape(s.name)}</option>`).join('');if([...resourceSkill.options].some(o=>o.value===current))resourceSkill.value=current;}const resources=ctx.getState().learningResources||[];if(resourceList)resourceList.innerHTML=resources.length?resources.map(r=>{const skill=skills.find(s=>s.id===r.skillId);return `<article class="learning-resource"><span>${({book:'📘',manual:'📗',course:'🎓',article:'📄',video:'▶'})[r.type]||'◆'}</span><div><strong>${ctx.escape(r.title)}</strong><small>${ctx.escape(skill?.name||ctx.t('learning.unlinked'))} · ${ctx.t(`learning.${r.type}`)}</small><p>${ctx.escape(r.notes||r.url||'')}</p></div><button class="icon-button danger" type="button" data-resource-delete="${r.id}">×</button></article>`}).join(''):`<div class="empty-state">${ctx.t('learning.noResources')}</div>`;}
  resourceForm?.addEventListener('submit',e=>{e.preventDefault();const d=new FormData(resourceForm),title=String(d.get('title')).trim();if(!title)return;ctx.updateState(s=>s.learningResources.unshift({id:ctx.uid(),title,type:String(d.get('type')),skillId:String(d.get('skillId')||''),url:String(d.get('url')||''),notes:String(d.get('notes')||''),createdAt:new Date().toISOString()}));resourceForm.reset();ctx.toast(ctx.t('learning.resourceAdded'));});
  resourceList?.addEventListener('click',e=>{const b=e.target.closest('[data-resource-delete]');if(b)ctx.updateState(s=>{s.learningResources=s.learningResources.filter(r=>r.id!==b.dataset.resourceDelete)})});
  ctx.subscribe(() => { render(); renderResources(); });
  document.addEventListener('languagechange', () => { render(); renderResources(); });
  render(); renderResources();
  return { render };
}

window.SUM_MODULES = window.SUM_MODULES || {};
window.SUM_MODULES.initLearning = initLearning;
})();
