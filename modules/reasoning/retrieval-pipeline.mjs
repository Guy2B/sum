export function retrieveEvidence(documents=[],query,{limit=5}={}){
  const terms=String(query).toLowerCase().split(/\s+/).filter(Boolean);
  return documents.map(document=>{
    const text=[document.title,document.content,...(document.tags||[])].join(' ').toLowerCase();
    const score=terms.reduce((sum,term)=>sum+(text.includes(term)?1:0),0);
    return {...structuredClone(document),score};
  }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,limit);
}
