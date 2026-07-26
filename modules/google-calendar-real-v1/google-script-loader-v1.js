(function(g){
  const loaded=new Map();
  function load(src,id){
    if(loaded.has(src))return loaded.get(src);
    const promise=new Promise((resolve,reject)=>{
      const existing=id&&document.getElementById(id);
      if(existing){existing.addEventListener('load',()=>resolve(existing),{once:true});return resolve(existing);}
      const script=document.createElement('script');
      if(id)script.id=id;script.src=src;script.async=true;script.defer=true;
      script.onload=()=>resolve(script);
      script.onerror=()=>reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(script);
    });
    loaded.set(src,promise);
    return promise;
  }
  async function loadGoogle(){
    await Promise.all([
      load('https://accounts.google.com/gsi/client','sigma-google-gis'),
      load('https://apis.google.com/js/api.js','sigma-google-gapi')
    ]);
    return{gis:Boolean(window.google?.accounts?.oauth2),gapi:Boolean(window.gapi)};
  }
  g.SigmaGoogleScriptLoaderV1={load,loadGoogle};
})(window);
