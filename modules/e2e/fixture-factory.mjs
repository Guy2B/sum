export function createFixture(overrides={}) {
  return {profile:{editions:['personal'],riskTolerance:'balanced'},signals:[],calendar:[],preferences:{},...overrides};
}
