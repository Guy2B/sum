'use strict';
document.addEventListener('DOMContentLoaded', () => {
  const config = window.SUM_CONFIG || {};
  document.querySelectorAll('[data-business]').forEach((el) => { el.textContent = config.legalEntity || 'Al.G.B.r. — operator details to be completed before publication'; });
  document.querySelectorAll('[data-support-email]').forEach((el) => {
    const email = config.supportEmail || '';
    el.textContent = email || 'Support email to be configured';
    if (email && el.tagName === 'A') el.href = `mailto:${email}`;
  });
  document.querySelectorAll('[data-legal-warning]').forEach((el) => { el.hidden = Boolean(config.legalEntity && config.supportEmail); });
});
