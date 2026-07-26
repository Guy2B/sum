export function resolveThemePreferences({mode='system',density='comfortable',contrast='normal',accent='default'}={}){
  if(!['system','light','dark'].includes(mode)) throw new Error('unsupported theme mode');
  return {mode,density,contrast,accent};
}
