export function resolveEditionConfig(edition='personal'){
  const editions={
    personal:{modules:['daily','memory','decision'],label:'Personal'},
    family:{modules:['daily','memory','trust','collaboration'],label:'Family'},
    creator:{modules:['daily','connectors','agents'],label:'Creator'},
    business:{modules:['operations','connectors','agents','trust'],label:'Small Business'}
  };
  return structuredClone(editions[edition]||editions.personal);
}
