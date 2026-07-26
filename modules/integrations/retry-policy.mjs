export function computeRetryDelay(attempt,{baseMs=500,maxMs=30000,jitter=0}={}){
  const exponential=Math.min(maxMs,baseMs*(2**Math.max(0,attempt-1)));
  return Math.round(exponential+(exponential*jitter));
}
export function shouldRetry(error,{attempt=1,maxAttempts=5}={}){
  if(attempt>=maxAttempts) return false;
  return Boolean(error?.retryable ?? true);
}
