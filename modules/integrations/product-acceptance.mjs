export function validateIntegrationHub(hub){const missing=['register','create','list'].filter(k=>typeof hub?.[k]!=='function');return{ok:missing.length===0,missing};}
