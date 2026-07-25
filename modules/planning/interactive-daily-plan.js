export class InteractiveDailyPlan {
  constructor({ store }) { this.store = store; }
  create({ workspaceId, date, items }) {
    return this.store.save('dailyPlans', { id: `${workspaceId}:${date}`, workspaceId, date, status: 'draft', items: items.map((item, index) => ({ ...item, order: index, decision: 'pending' })) });
  }
  decide(planId, itemId, decision) {
    if (!['accepted','rejected','deferred'].includes(decision)) throw new Error('invalid decision');
    const plan = this.store.get('dailyPlans', planId); if (!plan) throw new Error('plan not found');
    return this.store.save('dailyPlans', { ...plan, items: plan.items.map((i) => i.id === itemId ? { ...i, decision } : i) });
  }
  reorder(planId, orderedIds) {
    const plan = this.store.get('dailyPlans', planId); if (!plan) throw new Error('plan not found');
    const rank = new Map(orderedIds.map((id,index) => [id,index]));
    return this.store.save('dailyPlans', { ...plan, items: [...plan.items].sort((a,b) => (rank.get(a.id) ?? 999) - (rank.get(b.id) ?? 999)).map((i,index) => ({...i, order:index})) });
  }
  confirm(planId) { const plan=this.store.get('dailyPlans',planId); return this.store.save('dailyPlans',{...plan,status:'confirmed',confirmedAt:new Date().toISOString()}); }
}
