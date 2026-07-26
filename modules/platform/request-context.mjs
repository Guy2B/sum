export function createRequestContext({requestId,actor='system',traceId=null,locale='fr',metadata={}}={}) {
  if(!requestId) throw new Error('requestId is required');
  return {requestId,actor,traceId:traceId||requestId,locale,metadata:structuredClone(metadata)};
}
