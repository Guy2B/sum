'use strict';
const clamp=(v,min,max)=>Math.max(min,Math.min(max,Number(v)||0));
function createGoal(input={}){if(!input.workspaceId||!input.title)throw new TypeError('workspaceId and title are required');const now=input.createdAt||new Date().toISOString();return{id:String(input.id||`goal_${Date.now().toString(36)}`),workspaceId:String(input.workspaceId),title:String(input.title).trim().slice(0,240),status:input.status||'active',progress:clamp(input.progress,0,100),targetAt:input.targetAt||null,priority:clamp(input.priority||50,0,100),createdAt:now,updatedAt:now};}
function score(goal,now=Date.now()){const due=Date.parse(goal.targetAt||'');const urgency=Number.isFinite(due)?clamp(100-((due-now)/86400000)*5,0,100):30;const gap=100-clamp(goal.progress,0,100);return Math.round(goal.priority*.45+urgency*.3+gap*.25);}
function plan(goals,{capacity=5,now=Date.now()}={}){return(Array.isArray(goals)?goals:[]).filter(g=>g.status==='active').map(goal=>({goal,score:score(goal,now)})).sort((a,b)=>b.score-a.score||String(a.goal.id).localeCompare(String(b.goal.id))).slice(0,Math.max(1,capacity));}
module.exports={createGoal,score,plan};
