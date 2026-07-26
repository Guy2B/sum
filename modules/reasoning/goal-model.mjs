export function createGoal({id,name,weight=1,target=null,constraints=[],deadline=null}={}) {
  if(!id||!name) throw new Error('goal id and name are required');
  return {id,name,weight:Math.max(0,Number(weight)),target,constraints:[...constraints],deadline};
}
