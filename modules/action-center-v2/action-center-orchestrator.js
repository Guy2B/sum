(function(g){
  let rebuilding=false;
  let lastResult=null;

  function rebuild(options={}){
    if(rebuilding){
      return lastResult||{
        actions:[],
        today:[],
        risks:[],
        opportunities:[],
        communications:[],
        history:[],
        updatedAt:null
      };
    }

    rebuilding=true;

    try{
      const feed=window.SigmaUnifiedFeedStore?.load?.()||{items:[]};
      const normalized=(feed.items||[]).map(window.SigmaActionNormalizer.fromFeed);
      const state=window.SigmaActionState.merge(normalized);
      const actions=state.actions;
      const views=window.SigmaActionViews.split(actions);

      const result={
        actions,
        today:window.SigmaTodayPlanner.today(actions),
        risks:views.risks,
        opportunities:views.opportunities,
        communications:views.communications,
        history:window.SigmaDecisionHistory.list(),
        updatedAt:new Date().toISOString()
      };

      lastResult=result;

      if(!options.silent){
        window.dispatchEvent(
          new CustomEvent('sigma:action-center-updated',{
            detail:result
          })
        );
      }

      return result;
    }finally{
      rebuilding=false;
    }
  }

  function decide(actionId,label){
    const action=window.SigmaActionState.load().actions.find(
      x=>x.id===actionId
    );

    if(!action){
      return{ok:false,error:'Action introuvable'};
    }

    const result=window.SigmaActionExecutor.execute(action,label);

    window.SigmaDecisionHistory.record({
      actionId,
      label,
      result,
      sourceId:action.sourceId
    });

    rebuild();
    return result;
  }

  g.SigmaActionCenter={rebuild,decide};
})(window);
