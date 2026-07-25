export const WORKFLOW_STATES = ['detected','pending_approval','approved','planned','completed','rejected'];
export function transitionSignal(item, nextState) {
  if (!WORKFLOW_STATES.includes(nextState)) throw new Error(`Unknown state: ${nextState}`);
  if (item.action?.requiresApproval && nextState === 'planned' && item.state !== 'approved') {
    throw new Error('Approval required before planning this action');
  }
  return { ...item, state: nextState, history: [...(item.history ?? []), { state: nextState, at: new Date().toISOString() }] };
}
