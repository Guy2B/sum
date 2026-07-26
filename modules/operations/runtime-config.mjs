const DEFAULTS = {
  environment: 'development',
  logLevel: 'info',
  maxConcurrency: 4,
  requestTimeoutMs: 15000,
  gracefulShutdownMs: 10000,
};

export function loadRuntimeConfig(input = {}) {
  const config = { ...DEFAULTS, ...input };
  if (!['development', 'test', 'production'].includes(config.environment)) {
    throw new Error('invalid environment');
  }
  if (config.maxConcurrency < 1) throw new Error('maxConcurrency must be positive');
  return Object.freeze(config);
}
