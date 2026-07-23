'use strict';
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root){root.SigmaIntelligenceV1=root.SigmaIntelligenceV1||{};root.SigmaIntelligenceV1.TodayService=api;}})(typeof globalThis!=='undefined'?globalThis:this,function(){
 const SECTIONS=['actNow','replies','deadlines','opportunities','prepare','review'];
 const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
 const dateKey=(value=new Date())=>{const d=value instanceof Date?value:new Date(value);return Number.isFinite(d.getTime())?d.toISOString().slice(0,10):new Date().toISOString().slice(0,10);};
 function sectionFor(signal,now=Date.now()){
  const action=signal?.recommendation?.action,category=signal?.intelligence?.category,due=Date.parse(signal?.recommendation?.dueAt||signal?.intelligence?.urgency?.dueAt||'');
  if((signal?.intelligence?.priorityBand==='critical'||signal?.intelligence?.priorityScore>=80)&&(!Number.isFinite(due)||due<=now+86400000))return'actNow';
  if(action==='reply'||signal?.intelligence?.replyExpected)return'replies';
  if(Number.isFinite(due)&&due<=now+7*86400000)return'deadlines';
  if(action==='create_opportunity'||category==='opportunity')return'opportunities';
  if(action==='prepare_meeting'||category==='calendar')return'prepare';
  return'review';
 }
 function select(signals,options={}){
  const now=Number(options.now)||Date.now(),capacity=clamp(Number(options.capacityMinutes)||120,15,720),maxItems=clamp(Number(options.maxItems)||12,1,50),used=new Set(),sections=Object.fromEntries(SECTIONS.map(k=>[k,[]]));let spent=0;
  const rows=(Array.isArray(signals)?signals:[]).filter(s=>s&&s.status==='new').slice().sort((a,b)=>(b.intelligence?.priorityScore||0)-(a.intelligence?.priorityScore||0)||String(a.id).localeCompare(String(b.id)));
  for(const signal of rows){if(used.has(signal.id))continue;const effort=clamp(Number(signal.intelligence?.effortMinutes)||20,1,240),section=sectionFor(signal,now);if(spent+effort>capacity&&sections[section].length>0)continue;sections[section].push(signal);used.add(signal.id);spent+=effort;if(used.size>=maxItems)break;}
  return{date:dateKey(now),sections,signalIds:[...used],capacityMinutes:capacity,plannedMinutes:spent,remainingMinutes:Math.max(0,capacity-spent),generatedAt:new Date(now).toISOString(),engineVersion:'5.4.0'};
 }
 function flatten(projection){return SECTIONS.flatMap(section=>(projection?.sections?.[section]||[]).map(signal=>({section,signal})));}
 return Object.freeze({SECTIONS,dateKey,sectionFor,select,flatten});
});
