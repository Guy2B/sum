'use strict';
/**
 * Sigma Life OS — configuration des services en ligne.
 * Remplacer les URL après déploiement des connecteurs Node.
 * Les secrets OAuth/SMTP ne doivent JAMAIS être placés dans ce fichier public.
 */
window.SIGMA_ONLINE_CONFIG = Object.freeze({
  mailApiBaseUrl: '',       // ex. https://sigma-mail.onrender.com
  socialApiBaseUrl: '',     // ex. https://sigma-social.onrender.com
  calendarApiBaseUrl: '',   // ex. https://sigma-calendar.onrender.com
  localAiGatewayUrl: '',
  appsScriptUrl: ''
});
