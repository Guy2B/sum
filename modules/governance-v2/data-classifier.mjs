const defaultRules=[
  {classification:'restricted',patterns:[/password/i,/secret/i,/token/i]},
  {classification:'sensitive',patterns:[/email/i,/phone/i,/address/i,/health/i]},
  {classification:'internal',patterns:[/internal/i,/employee/i]}
];

export function classifyData(record={},rules=defaultRules){
  const labels=[];
  for(const [key,value] of Object.entries(record)){
    const text=`${key} ${typeof value==='string'?value:''}`;
    for(const rule of rules){
      if(rule.patterns.some(pattern=>pattern.test(text))){
        labels.push({field:key,classification:rule.classification});
        break;
      }
    }
  }
  const rank={public:0,internal:1,sensitive:2,restricted:3};
  const highest=labels.reduce(
    (current,item)=>rank[item.classification]>rank[current]?item.classification:current,
    'public'
  );
  return {classification:highest,fields:labels};
}
