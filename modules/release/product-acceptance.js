export function evaluateProductAcceptance({ dashboard, persistedSnapshot, apiActions = [] }) {
  const gates = {
    dashboardGenerated: Boolean(dashboard?.generatedAt),
    goalsVisible: Number.isInteger(dashboard?.counters?.activeGoals),
    tasksVisible: Number.isInteger(dashboard?.counters?.openTasks),
    persistenceVerified: Boolean(persistedSnapshot && Object.keys(persistedSnapshot).length),
    userActionsVerified: apiActions.includes('create-goal') && apiActions.includes('create-task') && apiActions.includes('complete-task')
  };
  return { ready: Object.values(gates).every(Boolean), gates, failed: Object.entries(gates).filter(([,v]) => !v).map(([k]) => k) };
}
