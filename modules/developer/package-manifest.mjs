export function createPackageManifest({name,version,files=[],dependencies={},checksum=null}={}) {
  if(!name||!version) throw new Error('package name and version are required');
  return {
    schema:'sigma-package-v1',
    name,
    version,
    files:[...new Set(files)],
    dependencies:structuredClone(dependencies),
    checksum
  };
}
