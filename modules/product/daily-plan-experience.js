const score = (task) => ({ high:3, medium:2, low:1 }[task.priority] ?? 1) + (task.dueAt ? 1 : 0);
export function buildDailyPlan(tasks, capacity = 5) {
  return tasks.filter(t=>t.status!=='done').sort((a,b)=>score(b)-score(a) || a.title.localeCompare(b.title)).slice(0, capacity).map((task,index)=>({ ...task, order:index+1, decision:'proposed' }));
}
export function decidePlanItem(item, decision) {
  if (!['accepted','rejected','deferred'].includes(decision)) throw new Error('Unsupported plan decision');
  return { ...item, decision };
}
