import {normalizeObjectives} from './objective-normalizer.mjs';
import {evaluateConstraints} from './constraint-engine.mjs';
import {computeUtility} from './utility-model.mjs';
import {assessRisk} from './risk-model.mjs';
import {explainDecision} from './explanation-builder.mjs';

export function createReasoningEngine(){
  return {
    evaluate(options=[],objectives=[],constraints=[]){
      const normalized=normalizeObjectives(objectives);
      const evaluations=options.map(option=>{
        const constraint=evaluateConstraints(option,constraints);
        const utility=computeUtility(option,normalized);
        const risk=assessRisk(option,option.risk||{});
        return {option,constraint,utility,risk,score:constraint.allowed?utility.score-risk.residualRisk:-Infinity};
      }).sort((a,b)=>b.score-a.score);
      const winner=evaluations[0];
      return {winner, evaluations, explanation:winner?explainDecision({winner:winner.option,utility:winner.utility,risk:winner.risk,alternatives:evaluations.slice(1)}):null};
    }
  };
}
