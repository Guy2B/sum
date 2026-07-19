'use strict';
(() => {
  function plugin() {
    return globalThis.Capacitor?.Plugins?.SigmaHealth || globalThis.SigmaHealthNative || null;
  }
  function platform() {
    try { return globalThis.Capacitor?.getPlatform?.() || 'web'; } catch { return 'web'; }
  }
  async function available(provider) {
    const native = plugin();
    if (!native?.isAvailable) return { available: false, platform: platform(), mode: 'web' };
    try { return await native.isAvailable({ provider }); } catch { return { available: false, platform: platform(), mode: 'native-error' }; }
  }
  async function connect(provider) {
    const native = plugin();
    if (!native?.requestAuthorization) throw new Error('NATIVE_HEALTH_UNAVAILABLE');
    const auth = await native.requestAuthorization({ provider, metrics: ['sleep','steps','activeEnergy','restingHeartRate','hrv','workouts'] });
    if (auth?.granted === false) throw new Error('HEALTH_PERMISSION_DENIED');
    return auth;
  }
  async function sync(provider, days = 14) {
    const native = plugin();
    if (!native?.readSummary) throw new Error('NATIVE_HEALTH_UNAVAILABLE');
    const result = await native.readSummary({ provider, days });
    return Array.isArray(result?.entries) ? result.entries : [];
  }
  window.SUM_NATIVE_HEALTH = { available, connect, sync, platform };
})();
