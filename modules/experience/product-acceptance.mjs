export function validateExperienceShell(shell){const missing=['render'].filter(k=>typeof shell?.[k]!=='function');return{ok:missing.length===0,missing};}
