export function createWorkflow({id,name,version='1.0.0',enabled=true,trigger,steps=[]}={}){
  if(!id||!name||!trigger) throw new Error('workflow id, name and trigger are required');
  return {
    id,name,version,enabled:Boolean(enabled),
    trigger:structuredClone(trigger),
    steps:steps.map((step,index)=>({
      id:step.id||`step_${index+1}`,
      type:step.type,
      config:structuredClone(step.config||{}),
      onError:step.onError||'stop'
    }))
  };
}
