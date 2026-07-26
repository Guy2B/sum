const DEFAULT_TERMS={
  urgent:4,
  asap:4,
  important:3,
  deadline:3,
  today:3,
  demain:2,
  action:2,
  required:2,
  requis:2,
  invoice:1,
  facture:1
};

export function scoreSignal(signal={},{
  terms=DEFAULT_TERMS,
  trustedSenders=[],
  now=()=>Date.now()
}={}){
  const text=String(signal.text||`${signal.title||''} ${signal.summary||''}`).toLowerCase();
  let score=0;
  const reasons=[];

  for(const [term,weight] of Object.entries(terms)){
    if(text.includes(term.toLowerCase())){
      score+=weight;
      reasons.push(`term:${term}`);
    }
  }

  if(signal.unread){
    score+=1;
    reasons.push('unread');
  }

  if(signal.hasAttachment){
    score+=0.5;
    reasons.push('attachment');
  }

  if(signal.sender&&trustedSenders.includes(signal.sender)){
    score+=2;
    reasons.push('trusted-sender');
  }

  const ageHours=Math.max(0,(now()-new Date(signal.receivedAt||0).getTime())/3600000);
  if(ageHours<=24){
    score+=1;
    reasons.push('recent');
  }

  const level=score>=7?'critical':score>=4?'high':score>=2?'medium':'low';
  return {score,level,reasons};
}

export function rankSignals(signals=[],options={}){
  return signals
    .map(signal=>({...structuredClone(signal),priority:scoreSignal(signal,options)}))
    .sort((a,b)=>b.priority.score-a.priority.score);
}
