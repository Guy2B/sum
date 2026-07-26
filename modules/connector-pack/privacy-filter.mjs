const DEFAULT_SENSITIVE_KEYS = ['accessToken', 'refreshToken', 'password', 'secret', 'rawMime'];

export function filterConnectorPayload(value, {
  sensitiveKeys = DEFAULT_SENSITIVE_KEYS,
  maxBodyLength = 20_000,
} = {}) {
  if (Array.isArray(value)) return value.map(item => filterConnectorPayload(item, { sensitiveKeys, maxBodyLength }));
  if (!value || typeof value !== 'object') return value;

  const output = {};
  for (const [key, item] of Object.entries(value)) {
    if (sensitiveKeys.some(sensitive => key.toLowerCase() === sensitive.toLowerCase())) continue;
    if ((key === 'body' || key === 'extractedText') && typeof item === 'string') {
      output[key] = item.slice(0, maxBodyLength);
    } else {
      output[key] = filterConnectorPayload(item, { sensitiveKeys, maxBodyLength });
    }
  }
  return output;
}
