export function createViewState(initial={}){
  let state=structuredClone(initial);
  return {
    get(){return structuredClone(state);},
    set(next){state=structuredClone(next);return structuredClone(state);},
    patch(delta){state={...state,...structuredClone(delta)};return structuredClone(state);},
    reset(){state=structuredClone(initial);return structuredClone(state);}
  };
}
