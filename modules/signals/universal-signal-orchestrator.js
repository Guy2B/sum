import { normalizeSignal } from './signal-normalizer.js';
import { activeKeywords } from './life-context-profiles.js';
import { classifySignal } from './contextual-signal-classifier.js';
import { prioritizeSignal } from './signal-priority-engine.js';
import { proposeAction } from './signal-action-proposer.js';
export function processSignal(raw, contexts=[]) {
  const signal=normalizeSignal(raw); const classification=classifySignal(signal,activeKeywords(contexts));
  const priority=prioritizeSignal(signal,classification); const action=proposeAction(signal,classification,priority);
  return { signal, classification, priority, action };
}
export function processSignals(rawSignals=[],contexts=[]) { return rawSignals.map(s=>processSignal(s,contexts)).sort((a,b)=>b.priority.score-a.priority.score); }
