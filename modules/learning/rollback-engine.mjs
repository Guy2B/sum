export function createRollbackStack(initial = null) {
  const stack = initial ? [initial] : [];
  return {
    push(model) { stack.push(model); return model; },
    rollback() {
      if (stack.length < 2) return stack[0] || null;
      stack.pop();
      return stack[stack.length - 1];
    },
    current() { return stack[stack.length - 1] || null; },
    size() { return stack.length; },
  };
}
