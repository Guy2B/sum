export function createStructuredLogger({ sink = console, context = {} } = {}) {
  function write(level, message, data = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...context,
      data,
    };
    const fn = sink[level] || sink.log;
    fn.call(sink, JSON.stringify(entry));
    return entry;
  }
  return {
    debug: (message, data) => write('debug', message, data),
    info: (message, data) => write('info', message, data),
    warn: (message, data) => write('warn', message, data),
    error: (message, data) => write('error', message, data),
    child(extra = {}) {
      return createStructuredLogger({ sink, context: { ...context, ...extra } });
    },
  };
}
