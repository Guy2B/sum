export function evaluateLearningPolicy(event,{
  allowedSources=[],
  deniedTypes=[],
  requireSubject=false,
  minimumRating=null
}={}){
  const reasons=[];
  if(allowedSources.length&&!allowedSources.includes(event.source)) reasons.push('source-not-allowed');
  if(deniedTypes.includes(event.type)) reasons.push('type-denied');
  if(requireSubject&&!event.subjectId) reasons.push('subject-required');
  if(minimumRating!==null&&(event.payload?.rating??0)<minimumRating) reasons.push('rating-too-low');
  return {accepted:reasons.length===0,reasons};
}
