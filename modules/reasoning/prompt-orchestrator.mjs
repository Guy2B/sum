export function composePrompt({system='',context=[],instructions=[],input=''}={}) {
  return [
    system.trim(),
    ...context.map(x=>`CONTEXT: ${x}`),
    ...instructions.map(x=>`INSTRUCTION: ${x}`),
    `INPUT: ${input}`
  ].filter(Boolean).join('\n\n');
}
