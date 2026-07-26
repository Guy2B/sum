export function createFailure({
  id,
  type,
  source,
  severity='medium',
  message,
  retryable=false,
  context={}
}={}){
  if(!id||!type||!source||!message) throw new Error('failure id, type, source and message are required');
  return {
    id,
    type,
    source,
    severity,
    message,
    retryable:Boolean(retryable),
    context:structuredClone(context),
    detectedAt:new Date().toISOString()
  };
}
