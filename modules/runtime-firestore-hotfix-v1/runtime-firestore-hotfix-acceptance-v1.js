(function(g){
  g.SigmaRuntimeFirestoreHotfixAcceptanceV1={validate(){
    const missing=[];
    if(!g.SigmaRuntimeFirestoreHotfixV1)missing.push('SigmaRuntimeFirestoreHotfixV1');
    const meta=document.querySelector('meta[name="sigma-release"]')?.content||null;
    return{ok:missing.length===0,missing,release:719,metaRelease:meta?Number(meta):null};
  }};
})(window);
