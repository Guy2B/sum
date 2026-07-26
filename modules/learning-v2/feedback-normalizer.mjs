export function normalizeFeedback(input={}){
  const rating=Number(input.rating);
  return {
    id:input.id||null,
    subjectId:input.subjectId||null,
    signalId:input.signalId||null,
    rating:Number.isFinite(rating)?Math.max(0,Math.min(1,rating)):null,
    accepted:Boolean(input.accepted),
    correctedLabel:input.correctedLabel||null,
    comment:input.comment||null,
    metadata:structuredClone(input.metadata||{})
  };
}
