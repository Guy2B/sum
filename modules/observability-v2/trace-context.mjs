export function createTraceContext({traceId,spanId,parentSpanId=null,baggage={}}={}){
  if(!traceId||!spanId) throw new Error('traceId and spanId are required');
  return {
    traceId,
    spanId,
    parentSpanId,
    baggage:structuredClone(baggage)
  };
}

export function childTraceContext(parent,spanId){
  if(!parent?.traceId||!spanId) throw new Error('parent trace and spanId are required');
  return createTraceContext({
    traceId:parent.traceId,
    spanId,
    parentSpanId:parent.spanId,
    baggage:parent.baggage
  });
}
