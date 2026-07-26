export async function replayTrace(trace=[],handlers={}) {
  const outputs=[];
  for(const event of trace){if(handlers[event.type]) outputs.push(await handlers[event.type](event.data));}
  return outputs;
}
