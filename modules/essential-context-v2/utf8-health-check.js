(function(g){
  const suspicious=new RegExp('(?:\\u00c3.|\\u00c2.|\\u00e2\\u20ac|\\ufffd|\\u039e\\u00a3)');
  function scanText(text){const matches=String(text||'').match(new RegExp(suspicious.source,'g'))||[];return{ok:matches.length===0,matches};}
  function scanDocument(root=document){
    const problems=[];
    root.querySelectorAll?.('body *')?.forEach?.(node=>{
      const result=scanText(node.textContent);
      if(!result.ok)problems.push({tag:node.tagName,id:node.id||null,text:node.textContent.slice(0,120),matches:result.matches});
    });
    return{ok:problems.length===0,problems,checkedAt:new Date().toISOString()};
  }
  g.SigmaUTF8Health={scanText,scanDocument};
})(window);
