export function validateDeveloperPlatform(platform){
  const missing=['runtime','sdk','status'].filter(k=>!platform?.[k]);
  return {ok:missing.length===0,missing};
}
