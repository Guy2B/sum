const PATTERNS = [
  { type: 'email', regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi },
  { type: 'phone', regex: /\b(?:\+?\d[\s.-]?){8,15}\b/g },
  { type: 'iban', regex: /\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b/gi },
];

export function redactSensitiveText(text = '', replacement = '[MASQUÉ]') {
  let output = String(text);
  const findings = [];
  for (const pattern of PATTERNS) {
    output = output.replace(pattern.regex, match => {
      findings.push({ type: pattern.type, length: match.length });
      return replacement;
    });
  }
  return { text: output, findings };
}
