export function rankAttentionItems(items=[]){
  return items.map(item=>({
    ...structuredClone(item),
    attentionScore:
      Number(item.urgency||0)*.4+
      Number(item.importance||0)*.35+
      Number(item.confidence||0)*.15+
      Number(item.recency||0)*.10
  })).sort((a,b)=>b.attentionScore-a.attentionScore);
}
