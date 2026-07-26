(function(g){
  async function runRule(rule,{force=false}={}){
    const snapshot=window.SigmaCommandCenter?.load?.()||window.SigmaCommandCenter?.rebuild?.()||{};
    if(!force&&!window.SigmaAutomationScheduler.due(rule))return{ok:false,status:'not-due'};
    const condition=window.SigmaAutomationConditions.evaluate(rule,{snapshot});
    if(!condition.ok){
      window.SigmaAutomationRuns.record({ruleId:rule.id,status:'condition-failed',condition});
      return{ok:false,status:'condition-failed',condition};
    }
    const startedAt=new Date().toISOString();
    let result;
    try{
      result=await window.SigmaAutomationActionAdapter.execute(rule,{snapshot});
    }catch(error){
      result={ok:false,error:error?.message||String(error)};
    }
    const finishedAt=new Date().toISOString();
    window.SigmaAutomationRuns.record({ruleId:rule.id,status:result.ok?'completed':'failed',startedAt,finishedAt,result});
    window.SigmaAutomationRules.upsert({...rule,lastRunAt:finishedAt,lastResult:result});
    window.dispatchEvent(new CustomEvent('sigma:automation-run',{detail:{rule,result}}));
    return{ok:Boolean(result.ok),status:result.ok?'completed':'failed',result};
  }
  async function runDue(){
    const outcomes=[];
    for(const rule of window.SigmaAutomationRules.list())if(window.SigmaAutomationScheduler.due(rule))outcomes.push(await runRule(rule));
    return outcomes;
  }
  g.SigmaAutomationEngine={runRule,runDue};
})(window);
