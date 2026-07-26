export function evaluateRatePolicy({used=0,limit=100,windowMs=60000}={}) {
  const remaining=Math.max(0,limit-used);
  return {
    allowed:used<limit,
    remaining,
    limit,
    windowMs,
    saturation:limit?Math.min(1,used/limit):1
  };
}
