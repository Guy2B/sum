(function(g){
  const KEY='sigma-unified-feed-cache-v2';let listeners=new Set();
  function load(){try{return JSON.parse(localStorage.getItem(KEY)||'{"items":[],"lastSyncAt":null,"errors":[]}');}catch{return{items:[],lastSyncAt:null,errors:[]};}}
  function save(value){localStorage.setItem(KEY,JSON.stringify(value));listeners.forEach(fn=>fn(value));return value;}
  function subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn);}
  g.SigmaUnifiedFeedStore={load,save,subscribe};
})(window);
