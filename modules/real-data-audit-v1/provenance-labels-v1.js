(function(g){
  const labels={real:'Réel',mixed:'Mixte',local:'Local',derived:'Calculé',demo:'Démo',unknown:'Inconnu'};
  function label(origin){return labels[origin]||labels.unknown;}
  function badge(origin){return`<span class="sigma-origin-badge" data-origin="${origin||'unknown'}">${label(origin)}</span>`;}
  function decorate(root=document){
    root.querySelectorAll?.('[data-sigma-source]').forEach(el=>{
      if(el.querySelector('.sigma-origin-badge'))return;
      const source=window.SigmaDataSourceRegistryV1?.get?.(el.dataset.sigmaSource);
      el.insertAdjacentHTML('afterbegin',badge(source?.origin||'unknown'));
    });
  }
  g.SigmaProvenanceLabelsV1={labels,label,badge,decorate};
})(window);
