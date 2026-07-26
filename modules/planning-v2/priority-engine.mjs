export function scorePriority(item={},weights={}){
  const urgency=Number(item.urgency||0);
  const impact=Number(item.impact||0);
  const effort=Number(item.effort||0);
  const risk=Number(item.risk||0);

  const score=
    urgency*(weights.urgency??1)+
    impact*(weights.impact??1)+
    risk*(weights.risk??0.5)-
    effort*(weights.effort??0.5);

  return {id:item.id||null,score,components:{urgency,impact,effort,risk}};
}

export function rankPriorities(items=[],weights={}){
  return items
    .map(item=>({...structuredClone(item),priority:scorePriority(item,weights)}))
    .sort((a,b)=>b.priority.score-a.priority.score);
}
