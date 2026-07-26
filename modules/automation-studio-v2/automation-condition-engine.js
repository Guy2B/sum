(function(g){
  function evaluate(rule,context){
    const condition=rule.condition;
    if(!condition)return{ok:true,reason:'aucune condition'};
    const metrics=context.snapshot?.metrics||{};
    const value=metrics[condition.metric];
    if(condition.operator==='gte')return{ok:Number(value)>=Number(condition.value),reason:`${condition.metric} >= ${condition.value}`};
    if(condition.operator==='lte')return{ok:Number(value)<=Number(condition.value),reason:`${condition.metric} <= ${condition.value}`};
    if(condition.operator==='eq')return{ok:value===condition.value,reason:`${condition.metric} = ${condition.value}`};
    return{ok:false,reason:'condition inconnue'};
  }
  g.SigmaAutomationConditions={evaluate};
})(window);
