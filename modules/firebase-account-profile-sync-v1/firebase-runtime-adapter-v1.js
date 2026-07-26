(function(g){
  function modular(){
    return{
      app:g.firebaseApp||g.SigmaFirebase?.app||null,
      auth:g.firebaseAuth||g.SigmaFirebase?.auth||null,
      db:g.firebaseDb||g.SigmaFirebase?.db||null,
      api:g.firebase||g.SigmaFirebase?.api||null
    };
  }
  function compat(){
    try{
      const app=g.firebase?.apps?.length?g.firebase.app():null;
      return{app,auth:app?.auth?.()||g.firebase?.auth?.()||null,db:app?.firestore?.()||g.firebase?.firestore?.()||null};
    }catch{return{app:null,auth:null,db:null};}
  }
  function currentUser(){
    const m=modular();
    return m.auth?.currentUser||compat().auth?.currentUser||g.SigmaAuth?.currentUser?.()||g.SigmaAuth?.user||null;
  }
  function mode(){
    if(modular().db)return'modular';
    if(compat().db)return'compat';
    return'none';
  }
  function ready(){return Boolean(currentUser()&&mode()!=='none');}
  g.SigmaFirebaseRuntimeAdapterV1={modular,compat,currentUser,mode,ready};
})(window);
