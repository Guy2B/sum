(function(g){
  const RELEASE='614';
  const MARKERS=[
    'SIGMA-ESSENTIAL-CONTEXT-V2',
    'SIGMA-UTF8-EXPERIENCE-POLISH-V2',
    'SIGMA-LIFE-JOURNEY-CALENDAR-V3',
    'SIGMA-LIFE-SUPPORT-COORDINATION-V3',
    'SIGMA-RELEASE-SYNC-614'
  ];
  function status(){
    const html=document.documentElement.innerHTML;
    const missing=MARKERS.filter(x=>!html.includes(x));
    return{
      release:RELEASE,
      ok:missing.length===0,
      missing,
      url:location.href,
      protocol:location.protocol,
      checkedAt:new Date().toISOString()
    };
  }
  g.SigmaReleaseStatus614={release:RELEASE,status};
  window.dispatchEvent(new CustomEvent('sigma:release-status',{detail:status()}));
})(window);
