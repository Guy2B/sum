export function extractFeatures(signal={}){
  const text=[signal.title,signal.body,signal.summary].filter(Boolean).join(' ');
  return {
    textLength:text.length,
    tokenEstimate:text?Math.ceil(text.length/4):0,
    hasDeadline:Boolean(signal.deadline||signal.dueAt),
    hasAttachment:Boolean(signal.attachments?.length),
    senderDomain:signal.sender?.includes('@')?signal.sender.split('@').pop():null,
    priorityHint:Number.isFinite(Number(signal.priority))?Number(signal.priority):null
  };
}
