export function createTelemetryEvent({
  id,
  type,
  source,
  timestamp=new Date().toISOString(),
  severity='info',
  attributes={},
  measurements={}
}={}){
  if(!id||!type||!source) throw new Error('telemetry id, type and source are required');
  return {
    id,
    type,
    source,
    timestamp,
    severity,
    attributes:structuredClone(attributes),
    measurements:structuredClone(measurements)
  };
}
