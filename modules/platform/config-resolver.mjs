export function resolveConfiguration({defaults={},environment={},runtime={}}={}) {
  return {
    ...structuredClone(defaults),
    ...structuredClone(environment),
    ...structuredClone(runtime)
  };
}
