export function applyImpactModel(state={},changes=[]){
  const output=structuredClone(state);
  const impacts=[];

  for(const change of changes){
    const current=Number(output[change.metric]??0);
    let next=current;
    switch(change.operation){
      case 'add': next=current+Number(change.value||0); break;
      case 'multiply': next=current*Number(change.value||1); break;
      case 'set': next=change.value; break;
      default: throw new Error(`unknown operation: ${change.operation}`);
    }
    output[change.metric]=next;
    impacts.push({metric:change.metric,before:current,after:next});
  }

  return {state:output,impacts};
}
