function setText(root,selector,value){
  const node=root.querySelector(selector);
  if(node) node.textContent=String(value);
}

export function renderLiveIntegration(root,viewModel){
  setText(root,'[data-live-connected]',viewModel.counters.connected);
  setText(root,'[data-live-priorities]',viewModel.counters.priorities);
  setText(root,'[data-live-unread]',viewModel.counters.unread);
  setText(root,'[data-live-awaiting-reply]',viewModel.counters.awaitingReply);
  setText(root,'[data-live-total]',viewModel.counters.total);

  const status=root.querySelector('[data-live-sync-status]');
  if(status){
    status.textContent=viewModel.sync.syncing
      ? 'Synchronisation…'
      : viewModel.sync.lastError
        ? `Erreur: ${viewModel.sync.lastError}`
        : viewModel.sync.lastSuccessAt
          ? `Dernière synchronisation: ${new Date(viewModel.sync.lastSuccessAt).toLocaleString()}`
          : 'Jamais synchronisé';
  }

  const priorityList=root.querySelector('[data-live-priority-list]');
  if(priorityList){
    priorityList.innerHTML=viewModel.prioritySignals.length
      ? viewModel.prioritySignals.map(item=>`<article class="live-item"><strong>${item.title}</strong><span>${item.sender||''}</span><b>${item.priority.level}</b></article>`).join('')
      : '<p>Aucune priorité détectée.</p>';
  }

  return viewModel;
}
