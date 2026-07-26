export function nextRetry(attempt,{baseDelayMs=1000,maxDelayMs=60000,jitter=0}={}){
  const delay=Math.min(maxDelayMs,baseDelayMs*2**Math.max(0,attempt-1));
  return Math.round(delay+(delay*jitter));
}
