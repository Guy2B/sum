'use strict';

(function initSignalObservatory(root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SIGMA_SIGNAL_OBSERVATORY = api;
})(typeof globalThis !== 'undefined' ? globalThis : window, function factory(root) {
  let lastSnapshot = null;

  function sourceCounts(items = []) {
    return items.reduce((acc, item) => {
      const source = String(item.sourceType || 'generic').toLowerCase();
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});
  }

  function snapshot(result = {}, state = {}) {
    const normalizedSignals = result.normalizedSignals || [];
    const rejected = result.rejected || result.today?.rejected || [];
    const selected = result.today?.items || [];

    lastSnapshot = {
      generatedAt: new Date().toISOString(),
      edition: result.edition || null,
      inputSignals: result.diagnostics?.inputSignals ?? normalizedSignals.length,
      normalizedSignals: result.diagnostics?.normalizedSignals ?? normalizedSignals.length,
      sourceDistribution:
        result.diagnostics?.sourceDistribution || sourceCounts(normalizedSignals),
      selectedCount: selected.length,
      rejectedCount: rejected.length,
      selectedSources: sourceCounts(selected),
      rejectionCounts: rejected.reduce((acc, item) => {
        acc[item.reason || 'unknown'] =
          (acc[item.reason || 'unknown'] || 0) + 1;
        return acc;
      }, {}),
      capacity: {
        usedMinutes: result.today?.usedMinutes || 0,
        capacityMinutes: result.today?.capacityMinutes || 0,
        remainingMinutes: result.today?.remainingMinutes || 0
      },
      provenance: result.diagnostics?.provenance || null,
      knowledgeGraph: result.diagnostics?.knowledgeGraph || null,
      arbitration: result.diagnostics?.arbitration || result.today?.audit || null,
      selected,
      rejected,
      stateSummary: {
        hasMail: Array.isArray(state.mailMessages),
        hasEvents: Array.isArray(state.events),
        hasTasks: Array.isArray(state.tasks),
        hasSocial: Array.isArray(state.socialInteractions),
        hasFinance:
          Array.isArray(state.financialAlerts) ||
          Array.isArray(state.moneyAlerts) ||
          Array.isArray(state.transactions)
      }
    };

    return lastSnapshot;
  }

  function print(result, state) {
    const data = snapshot(result, state);

    console.groupCollapsed(
      `[Sigma Observatory] ${data.selectedCount} selected / ${data.rejectedCount} rejected`
    );
    console.table([{
      inputSignals: data.inputSignals,
      normalizedSignals: data.normalizedSignals,
      selected: data.selectedCount,
      rejected: data.rejectedCount,
      usedMinutes: data.capacity.usedMinutes,
      capacityMinutes: data.capacity.capacityMinutes,
      edition: data.edition?.key || 'default'
    }]);

    console.log('Source distribution', data.sourceDistribution);
    console.log('Selected sources', data.selectedSources);
    console.log('Rejection counts', data.rejectionCounts);
    console.log('Provenance', data.provenance);
    console.log('Knowledge Graph', data.knowledgeGraph);
    console.log('Arbitration', data.arbitration);

    console.table(data.selected.map((item) => ({
      signalId: item.signalId,
      source: item.sourceType,
      title: item.title,
      action: item.action,
      score: item.score,
      effectiveScore: item.arbitration?.effectiveScore,
      cluster: item.arbitration?.clusterId,
      corroboratedBy: item.arbitration?.sourceFamilies?.join(', ')
    })));

    console.table(data.rejected.map((item) => ({
      signalId: item.signalId,
      source: item.sourceType,
      reason: item.reason,
      score: item.score,
      effectiveScore: item.effectiveScore,
      mergedInto: item.mergedInto
    })));

    console.groupEnd();
    return data;
  }

  function render(result, state, target) {
    const data = snapshot(result, state);
    const host = typeof target === 'string'
      ? document.querySelector(target)
      : target;

    if (!host) {
      throw new Error('Signal Observatory target element was not found');
    }

    const escapeHtml = (value) => String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;');

    const cards = [
      ['Input', data.inputSignals],
      ['Normalized', data.normalizedSignals],
      ['Selected', data.selectedCount],
      ['Rejected', data.rejectedCount],
      ['Used', `${data.capacity.usedMinutes} min`],
      ['Remaining', `${data.capacity.remainingMinutes} min`]
    ].map(([label, value]) =>
      `<div class="sigma-observatory-card"><strong>${escapeHtml(value)}</strong><span>${escapeHtml(label)}</span></div>`
    ).join('');

    const selectedRows = data.selected.map((item) => `
      <tr>
        <td>${escapeHtml(item.sourceType)}</td>
        <td>${escapeHtml(item.title)}</td>
        <td>${escapeHtml(item.action)}</td>
        <td>${escapeHtml(item.score)}</td>
        <td>${escapeHtml(item.arbitration?.effectiveScore)}</td>
      </tr>
    `).join('');

    const rejectedRows = data.rejected.map((item) => `
      <tr>
        <td>${escapeHtml(item.sourceType)}</td>
        <td>${escapeHtml(item.signalId)}</td>
        <td>${escapeHtml(item.reason)}</td>
        <td>${escapeHtml(item.score)}</td>
      </tr>
    `).join('');

    host.innerHTML = `
      <section class="sigma-observatory">
        <header>
          <div>
            <h2>Signal Observatory</h2>
            <p>Decision Engine V7.2 runtime audit</p>
          </div>
          <code>${escapeHtml(data.edition?.key || 'default')}</code>
        </header>
        <div class="sigma-observatory-grid">${cards}</div>

        <details open>
          <summary>Selected Today items</summary>
          <div class="sigma-observatory-table-wrap">
            <table>
              <thead><tr><th>Source</th><th>Signal</th><th>Action</th><th>Score</th><th>Effective</th></tr></thead>
              <tbody>${selectedRows || '<tr><td colspan="5">No selected signal</td></tr>'}</tbody>
            </table>
          </div>
        </details>

        <details>
          <summary>Rejected signals</summary>
          <div class="sigma-observatory-table-wrap">
            <table>
              <thead><tr><th>Source</th><th>ID</th><th>Reason</th><th>Score</th></tr></thead>
              <tbody>${rejectedRows || '<tr><td colspan="4">No rejected signal</td></tr>'}</tbody>
            </table>
          </div>
        </details>

        <details>
          <summary>Runtime JSON</summary>
          <pre>${escapeHtml(JSON.stringify({
            sourceDistribution: data.sourceDistribution,
            selectedSources: data.selectedSources,
            rejectionCounts: data.rejectionCounts,
            provenance: data.provenance,
            knowledgeGraph: data.knowledgeGraph,
            arbitration: data.arbitration
          }, null, 2))}</pre>
        </details>
      </section>
    `;

    return data;
  }

  function getLastSnapshot() {
    return lastSnapshot;
  }

  return {
    version: '8.0.0',
    snapshot,
    print,
    render,
    getLastSnapshot
  };
});
