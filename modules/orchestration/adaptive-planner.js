'use strict';
function effort(item){return Math.max(1,Number(item.effort)||1);}
function score(item,now=Date.now()){const urgency=item.dueAt?Math.max(0,100-Math.floor((new Date(item.dueAt).getTime()-now)/3600000)):0;return (Number(item.priority)||0)*10+urgency+(Number(item.impact)||0)*5;}
function buildAdaptivePlan(items,{capacity=8,now=Date.now()}={}){let used=0;const selected=[];const deferred=[];for(const item of [...items].sort((a,b)=>score(b,now)-score(a,now)||String(a.id).localeCompare(String(b.id)))){const cost=effort(item);if(used+cost<=capacity){selected.push(Object.freeze({...item,score:score(item,now)}));used+=cost;}else deferred.push(item);}return Object.freeze({selected:Object.freeze(selected),deferred:Object.freeze(deferred),capacity,used,remaining:capacity-used});}
function replan(plan,outcomes,{capacity=plan.capacity,now=Date.now()}={}){const done=new Set(outcomes.filter(o=>o.status==='done').map(o=>o.id));const carry=[...plan.selected,...plan.deferred].filter(i=>!done.has(i.id));return buildAdaptivePlan(carry,{capacity,now});}
module.exports={score,buildAdaptivePlan,replan};
