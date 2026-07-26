(function(g){
  const terms={urgent:5,important:3,deadline:4,échéance:4,aujourd:3,today:3,action:2,réponse:2,reply:2,client:2,contrat:3,facture:2,opportunité:3,mention:2};
  function score(item){
    const text=`${item.title} ${item.text}`.toLowerCase();let value=0,reasons=[];
    for(const [term,w] of Object.entries(terms))if(text.includes(term)){value+=w;reasons.push(term);}
    if(item.unread){value+=1;reasons.push('non-lu');}
    if(item.needsReply){value+=4;reasons.push('réponse-attendue');}
    if(item.engagement>=10){value+=2;reasons.push('engagement');}
    if(item.entities?.length){value+=2;reasons.push('lié-au-contexte');}
    const age=(Date.now()-new Date(item.publishedAt))/36e5;if(age<=24){value+=1;reasons.push('récent');}
    return {score:value,level:value>=8?'critical':value>=5?'high':value>=2?'medium':'low',reasons};
  }
  function rank(items){return items.map(x=>({...x,priority:score(x)})).sort((a,b)=>b.priority.score-a.priority.score);}
  g.SigmaUnifiedFeedPriority={score,rank};
})(window);
