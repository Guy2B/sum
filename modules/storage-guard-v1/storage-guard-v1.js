'use strict';
(function (root) {
  const state = {
    repaired: [],
    parseErrors: []
  };

  function safeParse(raw, fallback = null, key = null) {
    if (raw == null || raw === '') return fallback;

    try {
      return JSON.parse(raw);
    } catch (error) {
      state.parseErrors.push({
        key,
        message: error.message,
        valuePreview: String(raw).slice(0, 120),
        at: new Date().toISOString()
      });
      return fallback;
    }
  }

  function getJSON(key, fallback = null) {
    return safeParse(localStorage.getItem(key), fallback, key);
  }

  function setJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    return value;
  }

  function repairKnownKeys() {
    const repairs = [
      {
        key: 'sigma:connector-migration:v1',
        normalize(raw) {
          if (raw === 'done' || raw === '"done"') return JSON.stringify({ done: true });
          return raw;
        }
      }
    ];

    repairs.forEach(({ key, normalize }) => {
      const raw = localStorage.getItem(key);
      if (raw == null) return;
      const normalized = normalize(raw);
      if (normalized !== raw) {
        localStorage.setItem(key, normalized);
        state.repaired.push({ key, before: raw, after: normalized });
      }
    });
  }

  function scan() {
    const invalid = [];

    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (!key || !/^sigma:/i.test(key)) continue;
      const raw = localStorage.getItem(key);

      if (raw == null || raw === '') continue;
      if (/^(true|false|null|-?\d+(\.\d+)?)$/i.test(raw.trim())) continue;

      try {
        JSON.parse(raw);
      } catch (error) {
        invalid.push({ key, message: error.message, valuePreview: raw.slice(0, 120) });
      }
    }

    return invalid;
  }

  root.SigmaWaveStorageGuardV1 = {
    safeParse,
    getJSON,
    setJSON,
    repairKnownKeys,
    scan,
    diagnostics() {
      return {
        ok: true,
        repaired: [...state.repaired],
        parseErrors: [...state.parseErrors],
        invalidSigmaKeys: scan()
      };
    }
  };

  repairKnownKeys();
})(globalThis);
