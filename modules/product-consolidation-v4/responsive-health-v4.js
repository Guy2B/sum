(function(g){
  function inspect(){
    const viewport=window.innerWidth||0;
    const overflow=[...document.querySelectorAll('body *')].filter(el=>el.scrollWidth>el.clientWidth+3&&getComputedStyle(el).overflowX==='visible').slice(0,25);
    return{viewport,overflowCount:overflow.length,overflow:overflow.map(el=>({tag:el.tagName,id:el.id||'',className:String(el.className||'').slice(0,100)})),ok:overflow.length===0};
  }
  g.SigmaResponsiveHealthV4={inspect};
})(window);
