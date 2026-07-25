export function hasMojibake(value = '') {
  return /(?:Ã.|Â.|â€|ï¿½|RÃ|opportunitÃ|rÃ©)/u.test(String(value));
}

export function assertUtf8Text(value, label = 'text') {
  if (hasMojibake(value)) throw new Error(`${label} contains mojibake`);
  return String(value);
}

export function assertUtf8Document(html) {
  const source = String(html);
  if (!/<meta\s+charset=["']?utf-8["']?/i.test(source)) throw new Error('UTF-8 meta charset is required');
  assertUtf8Text(source, 'document');
  return true;
}
