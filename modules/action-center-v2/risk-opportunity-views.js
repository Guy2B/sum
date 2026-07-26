(function(g){
  function split(actions){
    return {
      risks:actions.filter(x=>window.SigmaActionClassifier.classify(x)==='risk'),
      opportunities:actions.filter(x=>window.SigmaActionClassifier.classify(x)==='opportunity'),
      communications:actions.filter(x=>window.SigmaActionClassifier.classify(x)==='communication')
    };
  }
  g.SigmaActionViews={split};
})(window);
