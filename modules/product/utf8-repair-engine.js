const DEFAULT_REPLACEMENTS = new Map([
  ['Î£', 'Σ'], ['â€”', '—'], ['â€“', '–'], ['â€™', '’'], ['â€œ', '“'], ['â€', '”'],
  ['â€¦', '…'], ['Â«', '«'], ['Â»', '»'], ['Â ', ' '], ['Ã©', 'é'], ['Ã¨', 'è'],
  ['Ãª', 'ê'], ['Ã«', 'ë'], ['Ã ', 'à'], ['Ã¢', 'â'], ['Ã´', 'ô'], ['Ã®', 'î'],
  ['Ã¯', 'ï'], ['Ã¹', 'ù'], ['Ã»', 'û'], ['Ã§', 'ç'], ['Å“', 'œ'], ['Ã‰', 'É'],
  ['Ã€', 'À'], ['Ã‡', 'Ç'], ['âŒ˜', '⌘']
]);
export function findMojibake(text='') {
  const matches = [];
  for (const token of DEFAULT_REPLACEMENTS.keys()) if (text.includes(token)) matches.push(token);
  if (text.includes('ï¿½')) matches.push('ï¿½');
  return [...new Set(matches)];
}
export function repairUtf8Text(text='') {
  let output = String(text);
  for (const [bad, good] of DEFAULT_REPLACEMENTS) output = output.split(bad).join(good);
  return output;
}
export function repairReport(text='') {
  const before = findMojibake(text);
  const repaired = repairUtf8Text(text);
  return { changed: repaired !== text, before, after: findMojibake(repaired), text: repaired };
}
