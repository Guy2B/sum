export function inferExplanationDepth(events = []) {
  const expanded = events.filter(e => e.type === 'explanation-expanded').length;
  const collapsed = events.filter(e => e.type === 'explanation-collapsed').length;
  if (expanded - collapsed >= 3) return 'detailed';
  if (collapsed - expanded >= 3) return 'brief';
  return 'standard';
}
