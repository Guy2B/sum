export function applyFeedback(model={weights:{}}, feedback={}) {
  const key=`${feedback.source||'other'}:${feedback.domain||'general'}`;
  const delta=feedback.correct===true?0.05:feedback.correct===false?-0.08:0;
  return { ...model, weights:{...model.weights,[key]:Math.max(-1,Math.min(1,(model.weights?.[key]||0)+delta))}, updatedAt:new Date().toISOString() };
}
