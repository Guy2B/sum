(function(g){
  const KEY='sigma-action-center-state-v2';
  function load(){try{return JSON.parse(localStorage.getItem(KEY)||'{"actions":[]}');}catch{return{actions:[]};}}
  function save(state){localStorage.setItem(KEY,JSON.stringify(state));return state;}
  function merge(actions){
    const current=load();const map=new Map(current.actions.map(x=>[x.id,x]));
    for(const action of actions){map.set(action.id,{...action,...(map.get(action.id)||{})});}
    return save({actions:[...map.values()]});
  }
  function update(id,patch){const state=load();state.actions=state.actions.map(x=>x.id===id?{...x,...patch,updatedAt:new Date().toISOString()}:x);return save(state);}
  g.SigmaActionState={load,save,merge,update};
})(window);
