export function createTraceRecorder(){const events=[];return{
  record(type,data={}){const e={type,data,at:new Date().toISOString()};events.push(e);return e;},
  list(){return structuredClone(events)}, clear(){events.length=0;}
};}
