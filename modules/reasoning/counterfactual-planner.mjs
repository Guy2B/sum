export function compareCounterfactual(base,alternative){
  const keys=[...new Set([...Object.keys(base||{}),...Object.keys(alternative||{})])];
  return keys.map(key=>({key,before:base?.[key],after:alternative?.[key],changed:base?.[key]!==alternative?.[key]}));
}
