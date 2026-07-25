import { findMojibake } from '../product/utf8-repair-engine.js';
export function signalQualityGate({files=[],results=[]}={}) {
  const encodingIssues=files.flatMap(f=>findMojibake(f.content||'').map(token=>({path:f.path,token})));
  const invalid=results.filter(r=>!r.signal?.id||!r.priority?.priority||!r.action?.title);
  return { ok:encodingIssues.length===0&&invalid.length===0,encodingIssues,invalidCount:invalid.length };
}
