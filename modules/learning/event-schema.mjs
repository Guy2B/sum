export function createLearningEvent({
  type,
  subject = 'user',
  context = {},
  outcome = null,
  feedback = null,
  occurredAt = new Date().toISOString(),
} = {}) {
  if (!type) throw new Error('type is required');
  return {
    id: `learn_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    type,
    subject,
    context,
    outcome,
    feedback,
    occurredAt,
    schemaVersion: 1,
  };
}
