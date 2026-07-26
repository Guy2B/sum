import {composePrompt} from './prompt-orchestrator.mjs';
import {routeModel} from './model-router.mjs';
import {estimateConfidence} from './confidence-estimator.mjs';
import {evaluateSafety} from './safety-reasoner.mjs';

export function createReasoningOrchestrator({providers=[],policies=[],toolEngine=null}={}){
  return {
    async reason({system,context,instructions,input,requiredCapabilities=[],evidence=[]}={}){
      const safety=evaluateSafety({request:{input},policies});
      if(!safety.allowed) return {status:'blocked',safety};
      const provider=routeModel(providers,{requiredCapabilities});
      const prompt=composePrompt({system,context,instructions,input});
      const response=await provider.invoke({prompt,toolEngineAvailable:Boolean(toolEngine)});
      return {
        status:'completed',
        provider:provider.id,
        response,
        confidence:estimateConfidence({evidence,agreement:1,coverage:.8,uncertainty:.2}),
        safety
      };
    }
  };
}
