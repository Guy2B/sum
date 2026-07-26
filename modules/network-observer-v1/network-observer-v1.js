'use strict';
(function (root) {
  const MAX_EVENTS = 100;
  const events = [];

  function push(event) {
    events.push({ ...event, at: new Date().toISOString() });
    if (events.length > MAX_EVENTS) events.splice(0, events.length - MAX_EVENTS);
  }

  function summarizeBody(body) {
    if (body == null) return null;
    if (typeof body === 'string') return body.slice(0, 500);
    try { return JSON.stringify(body).slice(0, 500); }
    catch (_) { return String(body).slice(0, 500); }
  }

  if (!root.__sigmaOriginalFetch) {
    root.__sigmaOriginalFetch = root.fetch.bind(root);

    root.fetch = async function sigmaObservedFetch(input, init) {
      const url = typeof input === 'string' ? input : input?.url;
      const method = init?.method || input?.method || 'GET';
      const started = performance.now();

      try {
        const response = await root.__sigmaOriginalFetch(input, init);
        const clone = response.clone();
        let payload = null;

        try {
          const type = clone.headers.get('content-type') || '';
          payload = type.includes('application/json')
            ? await clone.json()
            : await clone.text();
        } catch (_) {}

        push({
          kind: 'fetch',
          url,
          method,
          status: response.status,
          ok: response.ok,
          durationMs: Math.round(performance.now() - started),
          response: summarizeBody(payload)
        });

        if (!response.ok) {
          root.dispatchEvent(new CustomEvent('sigma:backend-error', {
            detail: { url, method, status: response.status, payload }
          }));
        }

        return response;
      } catch (error) {
        push({
          kind: 'fetch-error',
          url,
          method,
          durationMs: Math.round(performance.now() - started),
          error: error?.message || String(error)
        });
        throw error;
      }
    };
  }

  root.addEventListener('error', event => {
    push({
      kind: 'window-error',
      message: event.message,
      source: event.filename,
      line: event.lineno,
      column: event.colno
    });
  });

  root.addEventListener('unhandledrejection', event => {
    push({
      kind: 'unhandledrejection',
      message: event.reason?.message || String(event.reason)
    });
  });

  root.SigmaWaveNetworkObserverV1 = {
    clear() { events.length = 0; },
    events() { return [...events]; },
    failures() {
      return events.filter(event =>
        event.kind === 'fetch-error' ||
        event.kind === 'window-error' ||
        event.kind === 'unhandledrejection' ||
        (event.kind === 'fetch' && event.ok === false)
      );
    },
    diagnostics() {
      return {
        ok: true,
        eventCount: events.length,
        failureCount: this.failures().length,
        recentFailures: this.failures().slice(-20)
      };
    }
  };
})(globalThis);
