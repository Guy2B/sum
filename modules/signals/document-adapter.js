export function normalizeDocument(document = {}) {
  if (!document.id) throw new Error('Document id is required');
  return {
    id: `document:${document.id}`,
    source: 'document',
    sourceId: document.id,
    title: document.title ?? document.filename ?? '(document)',
    body: document.text ?? '',
    mimeType: document.mimeType ?? 'application/octet-stream',
    provenance: { filename: document.filename ?? null, sourceId: document.id }
  };
}
