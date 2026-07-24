'use strict';
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.SIGMA_EVENT_BUS=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  function createEventBus(options={}){
    const handlers=new Map(); const history=[]; const maxHistory=Math.max(0,Number(options.maxHistory)||200);
    const on=(type,handler)=>{if(typeof handler!=='function')throw new TypeError('handler must be a function');const set=handlers.get(type)||new Set();set.add(handler);handlers.set(type,set);return()=>set.delete(handler);};
    const emit=async(type,payload={},metadata={})=>{if(!type)throw new TypeError('event type is required');const event=Object.freeze({id:metadata.id||`${Date.now()}-${Math.random().toString(36).slice(2)}`,type,payload,occurredAt:metadata.occurredAt||new Date().toISOString(),actorId:metadata.actorId||null,workspaceId:metadata.workspaceId||null,correlationId:metadata.correlationId||null,version:1});if(maxHistory){history.push(event);if(history.length>maxHistory)history.splice(0,history.length-maxHistory);}const listeners=[...(handlers.get(type)||[]),...(handlers.get('*')||[])];for(const listener of listeners)await listener(event);return event;};
    return Object.freeze({on,once(type,handler){let off;off=on(type,async e=>{off();await handler(e);});return off;},emit,history:()=>history.slice(),clear:()=>history.splice(0,history.length)});
  }
  return Object.freeze({createEventBus});
});
