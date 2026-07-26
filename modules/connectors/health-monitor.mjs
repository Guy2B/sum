export function evaluateConnectorHealth({
  lastSuccessAt = null,
  consecutiveFailures = 0,
  credentialStatus = 'valid',
  lagMinutes = 0,
} = {}) {
  let score = 100;
  const issues = [];

  if (credentialStatus === 'expired') {
    score -= 60;
    issues.push('credentials expired');
  } else if (credentialStatus === 'missing') {
    score -= 80;
    issues.push('credentials missing');
  }

  score -= Math.min(30, consecutiveFailures * 10);
  if (consecutiveFailures) issues.push(`${consecutiveFailures} consecutive failure(s)`);

  if (lagMinutes > 60) {
    score -= Math.min(30, Math.round(lagMinutes / 30));
    issues.push(`sync lag ${lagMinutes} minutes`);
  }

  if (!lastSuccessAt) {
    score -= 15;
    issues.push('no successful sync recorded');
  }

  score = Math.max(0, score);
  const status = score >= 85 ? 'healthy' : score >= 60 ? 'degraded' : 'down';
  return { score, status, issues };
}
