export function createReview(state, now = new Date()) {
  const done = state.tasks.filter(t=>t.status==='done');
  const open = state.tasks.filter(t=>t.status!=='done');
  return { id:`review-${now.toISOString().slice(0,10)}`, date:now.toISOString(), completed:done.length, remaining:open.length, highlights:done.slice(0,3).map(t=>t.title), note:'' };
}
export function addReviewNote(review, note) { return { ...review, note:String(note ?? '').trim() }; }
