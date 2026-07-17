'use strict';
(() => {
function initProjects(ctx) {
  const form = document.getElementById('project-form');
  const list = document.getElementById('project-list');

  function render() {
    const projects = ctx.getState().projects;
    list.innerHTML = projects.length ? projects.map((project) => {
      const completed = project.steps.filter((step) => step.done).length;
      const progress = project.steps.length ? Math.round((completed / project.steps.length) * 100) : 0;
      return `<article class="project-card card">
        <div class="project-head">
          <div>
            <h3>${ctx.escape(project.name)}</h3>
            <p>${ctx.escape(project.description || '')}</p>
          </div>
          <button class="icon-button danger" type="button" data-project-delete="${project.id}" aria-label="${ctx.t('common.delete')}">×</button>
        </div>
        <div class="progress-track"><span style="width:${progress}%"></span></div>
        <div class="progress-label">${ctx.t('projects.stepsComplete', { done: completed, total: project.steps.length })}</div>
        <div class="project-steps">
          ${project.steps.map((step) => `<label class="step-row ${step.done ? 'is-complete' : ''}">
            <input type="checkbox" data-step-toggle="${step.id}" data-project-id="${project.id}" ${step.done ? 'checked' : ''}>
            <span>${ctx.escape(step.text)}</span>
            <button class="step-delete" type="button" data-step-delete="${step.id}" data-project-id="${project.id}" aria-label="${ctx.t('common.delete')}">×</button>
          </label>`).join('')}
        </div>
        <form class="inline-form" data-step-form="${project.id}">
          <input name="step" required data-i18n-placeholder="projects.stepPlaceholder" placeholder="${ctx.t('projects.stepPlaceholder')}">
          <button class="button secondary small" type="submit">${ctx.t('projects.addStep')}</button>
        </form>
      </article>`;
    }).join('') : `<div class="empty-state">${ctx.t('projects.empty')}</div>`;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = String(data.get('name')).trim();
    if (!name) return;
    const firstStep = String(data.get('firstStep')).trim();
    ctx.updateState((state) => {
      state.projects.unshift({
        id: ctx.uid(), name, description: String(data.get('description')).trim(), createdAt: new Date().toISOString(),
        steps: firstStep ? [{ id: ctx.uid(), text: firstStep, done: false }] : []
      });
    });
    form.reset();
    ctx.toast(ctx.t('toast.projectAdded'));
  });

  list.addEventListener('submit', (event) => {
    const stepForm = event.target.closest('[data-step-form]');
    if (!stepForm) return;
    event.preventDefault();
    const input = stepForm.elements.step;
    const text = input.value.trim();
    if (!text) return;
    ctx.updateState((state) => {
      state.projects.find((project) => project.id === stepForm.dataset.stepForm)?.steps.push({ id: ctx.uid(), text, done: false });
    });
    input.value = '';
    ctx.toast(ctx.t('toast.stepAdded'));
  });

  list.addEventListener('change', (event) => {
    const checkbox = event.target.closest('[data-step-toggle]');
    if (!checkbox) return;
    ctx.updateState((state) => {
      const project = state.projects.find((item) => item.id === checkbox.dataset.projectId);
      const step = project?.steps.find((item) => item.id === checkbox.dataset.stepToggle);
      if (step) step.done = checkbox.checked;
    });
  });

  list.addEventListener('click', (event) => {
    const projectButton = event.target.closest('[data-project-delete]');
    if (projectButton) {
      ctx.updateState((state) => { state.projects = state.projects.filter((item) => item.id !== projectButton.dataset.projectDelete); });
      return;
    }
    const stepButton = event.target.closest('[data-step-delete]');
    if (stepButton) {
      ctx.updateState((state) => {
        const project = state.projects.find((item) => item.id === stepButton.dataset.projectId);
        if (project) project.steps = project.steps.filter((step) => step.id !== stepButton.dataset.stepDelete);
      });
    }
  });

  ctx.subscribe(render);
  document.addEventListener('languagechange', render);
  render();
  return { render };
}

window.SUM_MODULES = window.SUM_MODULES || {};
window.SUM_MODULES.initProjects = initProjects;
})();
