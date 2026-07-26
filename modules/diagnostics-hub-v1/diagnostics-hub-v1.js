'use strict';
(function (root) {
  function call(name, method = 'diagnostics') {
    try {
      const target = root[name];
      if (!target || typeof target[method] !== 'function') {
        return { available: false };
      }
      return { available: true, result: target[method]() };
    } catch (error) {
      return { available: true, error: error?.message || String(error) };
    }
  }

  root.SigmaWaveDiagnosticsHubV1 = {
    snapshot() {
      return {
        generatedAt: new Date().toISOString(),
        location: location.href,
        online: navigator.onLine,
        identityPro: call('SigmaWaveIdentityProV2'),
        googleYouTube: call('SigmaWaveGoogleYouTubeV2'),
        linkedin: call('SigmaWaveLinkedInV2'),
        connectors: call('SigmaWaveConnectorsV3'),
        storage: call('SigmaWaveStorageGuardV1'),
        network: call('SigmaWaveNetworkObserverV1'),
        firestore: call('SigmaRuntimeFirestoreHotfixV1'),
        accountProviderWave: call('SigmaAccountProviderWaveV1')
      };
    },

    copy() {
      const text = JSON.stringify(this.snapshot(), null, 2);
      return navigator.clipboard?.writeText(text).then(() => text, () => text) || Promise.resolve(text);
    }
  };
})(globalThis);
