export function createActionDrawer(actions=[]){
  return actions.map((action,index)=>({
    id:action.id||`action_${index+1}`,
    label:action.label||action.type||'Action',
    type:action.type||'generic',
    approvalRequired:Boolean(action.approvalRequired),
    enabled:action.enabled!==false,
    payload:structuredClone(action.payload||{})
  }));
}
