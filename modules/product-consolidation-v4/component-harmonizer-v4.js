(function(g){
  function apply(){
    document.querySelectorAll('.card').forEach(el=>el.classList.add('sigma-consolidated-card'));
    document.querySelectorAll('.page-heading').forEach(el=>el.classList.add('sigma-consolidated-heading'));
    document.querySelectorAll('.button.primary').forEach(el=>el.classList.add('sigma-primary-action'));
    document.documentElement.dataset.sigmaConsolidation='629';
    return{cards:document.querySelectorAll('.sigma-consolidated-card').length,headings:document.querySelectorAll('.sigma-consolidated-heading').length};
  }
  g.SigmaComponentHarmonizerV4={apply};
})(window);
