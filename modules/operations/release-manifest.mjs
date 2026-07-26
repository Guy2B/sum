export function createReleaseManifest({
  version,
  commit = null,
  modules = [],
  tests = {},
} = {}) {
  if (!version) throw new Error('version is required');
  return {
    version,
    commit,
    modules: [...modules].sort(),
    tests,
    generatedAt: new Date().toISOString(),
    format: 'sigma-release-v1',
  };
}
