'use strict';
(() => {
  if (window.Chart) return;

  class FallbackChart {
    constructor(canvas, config) {
      this.canvas = canvas;
      this.config = config || {};
      this.resize = this.draw.bind(this);
      window.addEventListener('resize', this.resize);
      this.draw();
    }
    destroy() { window.removeEventListener('resize', this.resize); const ctx = this.canvas.getContext('2d'); ctx?.clearRect(0, 0, this.canvas.width, this.canvas.height); }
    setup() {
      const ratio = Math.min(2, window.devicePixelRatio || 1);
      const width = Math.max(280, this.canvas.clientWidth || 480);
      const height = Math.max(210, this.canvas.clientHeight || 280);
      this.canvas.width = width * ratio;
      this.canvas.height = height * ratio;
      const ctx = this.canvas.getContext('2d');
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const styles = getComputedStyle(document.documentElement);
      return { ctx, width, height, text: styles.getPropertyValue('--muted').trim() || '#68758c', grid: styles.getPropertyValue('--border').trim() || 'rgba(90,110,150,.18)', primary: styles.getPropertyValue('--primary').trim() || '#5370ff', surface: styles.getPropertyValue('--surface-2').trim() || '#eef2f8' };
    }
    draw() {
      const env = this.setup();
      const type = this.config.type;
      if (type === 'radar') return this.radar(env);
      if (type === 'bar') return this.bar(env);
      if (type === 'line') return this.line(env);
      if (type === 'doughnut') return this.doughnut(env);
    }
    text(ctx, value, x, y, align = 'center') { ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--muted').trim() || '#68758c'; ctx.font = '600 11px Inter, Segoe UI, sans-serif'; ctx.textAlign = align; ctx.fillText(String(value), x, y); }
    radar({ ctx, width, height, text, grid, primary }) {
      const labels = this.config.data?.labels || [];
      const values = this.config.data?.datasets?.[0]?.data || [];
      const count = Math.max(3, labels.length); const cx = width / 2; const cy = height / 2 + 4; const radius = Math.min(width, height) * .31;
      ctx.lineWidth = 1;
      for (let ring = 1; ring <= 5; ring++) {
        ctx.beginPath();
        for (let i = 0; i < count; i++) { const a = -Math.PI / 2 + i * Math.PI * 2 / count; const r = radius * ring / 5; const x = cx + Math.cos(a) * r; const y = cy + Math.sin(a) * r; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
        ctx.closePath(); ctx.strokeStyle = grid; ctx.stroke();
      }
      for (let i = 0; i < count; i++) { const a = -Math.PI / 2 + i * Math.PI * 2 / count; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * radius, cy + Math.sin(a) * radius); ctx.strokeStyle = grid; ctx.stroke(); const lx = cx + Math.cos(a) * (radius + 28); const ly = cy + Math.sin(a) * (radius + 22); this.text(ctx, labels[i] || '', lx, ly); }
      ctx.beginPath();
      values.forEach((value, i) => { const a = -Math.PI / 2 + i * Math.PI * 2 / count; const r = radius * Math.max(0, Math.min(100, Number(value) || 0)) / 100; const x = cx + Math.cos(a) * r; const y = cy + Math.sin(a) * r; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
      ctx.closePath(); ctx.fillStyle = 'rgba(83,112,255,.18)'; ctx.fill(); ctx.strokeStyle = primary; ctx.lineWidth = 2; ctx.stroke();
    }
    bar({ ctx, width, height, grid, primary }) {
      const labels = this.config.data?.labels || []; const values = this.config.data?.datasets?.[0]?.data || [];
      const pad = { l: 42, r: 18, t: 20, b: 42 }; const chartW = width - pad.l - pad.r; const chartH = height - pad.t - pad.b;
      const max = Math.max(1, ...values.map((v) => Math.abs(Number(v) || 0))); const zero = pad.t + chartH / 2;
      ctx.strokeStyle = grid; ctx.beginPath(); ctx.moveTo(pad.l, zero); ctx.lineTo(width - pad.r, zero); ctx.stroke();
      const slot = chartW / Math.max(1, values.length); const barW = Math.min(42, slot * .56);
      values.forEach((value, i) => { const numeric = Number(value) || 0; const h = Math.abs(numeric) / max * chartH * .44; const x = pad.l + slot * i + (slot - barW) / 2; const y = numeric >= 0 ? zero - h : zero; ctx.fillStyle = numeric >= 0 ? primary : '#df5b65'; ctx.beginPath(); ctx.roundRect(x, y, barW, Math.max(2, h), 7); ctx.fill(); this.text(ctx, labels[i] || '', x + barW / 2, height - 16); });
    }
    line({ ctx, width, height, grid, primary }) {
      const labels = this.config.data?.labels || []; const sets = this.config.data?.datasets || [];
      const pad = { l: 35, r: 16, t: 28, b: 36 }; const chartW = width - pad.l - pad.r; const chartH = height - pad.t - pad.b;
      const values = sets.flatMap((set) => set.data || []).map(Number); const max = Math.max(10, ...values); const min = Math.min(0, ...values);
      for (let i = 0; i <= 4; i++) { const y = pad.t + chartH * i / 4; ctx.strokeStyle = grid; ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(width - pad.r, y); ctx.stroke(); }
      const colors = [primary, '#18a999', '#9656e8'];
      sets.forEach((set, setIndex) => { ctx.beginPath(); (set.data || []).forEach((value, i) => { const x = pad.l + chartW * (labels.length <= 1 ? .5 : i / (labels.length - 1)); const y = pad.t + chartH - ((Number(value) - min) / Math.max(1, max - min)) * chartH; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.strokeStyle = set.borderColor || colors[setIndex % colors.length]; ctx.lineWidth = 2.4; ctx.stroke(); });
      labels.forEach((label, i) => { if (i % Math.max(1, Math.ceil(labels.length / 5)) === 0) this.text(ctx, label, pad.l + chartW * (labels.length <= 1 ? .5 : i / (labels.length - 1)), height - 13); });
    }
    doughnut({ ctx, width, height, surface }) {
      const data = this.config.data?.datasets?.[0]?.data || []; const labels = this.config.data?.labels || []; const total = data.reduce((sum, v) => sum + Math.max(0, Number(v) || 0), 0) || 1;
      const colors = this.config.data?.datasets?.[0]?.backgroundColor || ['#5370ff', '#18a999', '#9656e8', '#ff9f43', '#3aa3ff', '#ef5da8'];
      const cx = width / 2; const cy = height * .42; const outer = Math.min(width, height) * .25; const inner = outer * .64; let angle = -Math.PI / 2;
      data.forEach((value, i) => { const next = angle + Math.PI * 2 * Math.max(0, Number(value) || 0) / total; ctx.beginPath(); ctx.arc(cx, cy, outer, angle, next); ctx.arc(cx, cy, inner, next, angle, true); ctx.closePath(); ctx.fillStyle = colors[i % colors.length]; ctx.fill(); angle = next; });
      ctx.fillStyle = surface; ctx.beginPath(); ctx.arc(cx, cy, inner - 1, 0, Math.PI * 2); ctx.fill();
      const shown = labels.slice(0, 4); shown.forEach((label, i) => { const x = width / 2 - 100 + (i % 2) * 200; const y = height * .78 + Math.floor(i / 2) * 22; ctx.fillStyle = colors[i % colors.length]; ctx.beginPath(); ctx.arc(x - 8, y - 3, 4, 0, Math.PI * 2); ctx.fill(); this.text(ctx, label, x, y, 'left'); });
    }
  }
  window.Chart = FallbackChart;
})();
