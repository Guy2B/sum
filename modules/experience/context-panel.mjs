export function buildContextPanel({title='Context',facts=[],sources=[],warnings=[]}={}){
  return {
    title,
    facts:facts.map(String),
    sources:sources.map(source=>({label:source.label||source.id,href:source.href||null})),
    warnings:warnings.map(String)
  };
}
