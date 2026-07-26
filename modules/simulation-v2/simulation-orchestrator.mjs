import {evaluateConstraints} from './constraint-engine.mjs';
import {scoreObjectives} from './objective-scorer.mjs';
import {createSimulationAudit} from './simulation-audit.mjs';

export function createSimulationOrchestrator(){
  const audit=createSimulationAudit();

  return {
    evaluate({
      scenario,
      options=[],
      simulate,
      constraints=[]
    }={}){
      if(!scenario||typeof simulate!=='function') throw new Error('scenario and simulate are required');

      const evaluated=options.map((option,index)=>{
        const outcomes=simulate(structuredClone(scenario),structuredClone(option));
        const feasibility=evaluateConstraints(constraints,{scenario,option,outcomes});
        const scoring=scoreObjectives(scenario.objectives||[],outcomes);
        return {
          id:option.id||`option_${index+1}`,
          option:structuredClone(option),
          outcomes:structuredClone(outcomes),
          feasibility,
          scoring
        };
      });

      const ranked=evaluated
        .filter(item=>item.feasibility.feasible)
        .sort((a,b)=>b.scoring.score-a.scoring.score);

      audit.record({
        type:'scenario-evaluated',
        scenarioId:scenario.id,
        options:evaluated.length,
        feasible:ranked.length
      });

      return {
        scenarioId:scenario.id,
        evaluated,
        ranked,
        recommendation:ranked[0]||null
      };
    },

    audit(filters={}){
      return audit.list(filters);
    }
  };
}
