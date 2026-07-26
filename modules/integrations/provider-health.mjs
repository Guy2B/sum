export function computeProviderHealth({latencyMs=0,errorRate=0,rateLimited=false,authenticated=true}={}) {
  const latencyPenalty=Math.min(1,latencyMs/5000);
  const score=Math.max(0,1-(latencyPenalty*.3+Math.min(1,errorRate)*.5+(rateLimited?.15:0)+(authenticated?0:.5)));
  return {score,status:score>=.8?'healthy':score>=.5?'degraded':'unhealthy'};
}
