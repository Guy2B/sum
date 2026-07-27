'use strict';

window.SIGMA_GOOGLE_CLOUD_CONFIG = Object.freeze({
  // Public OAuth Web Client ID. Never place a client secret here.
  oauthClientId: '669651136797-lv4f7hnd053shmn128i9phess4sigs85.apps.googleusercontent.com',

  // Optional public browser API key, restricted in Google Cloud.
  apiKey: '',

  discoveryDoc: 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',

  // Optional Google Apps Script /exec URL used as a Gemini proxy.
  appsScriptAiProxyUrl: '',

  gmailMaxMessages: 30,
  calendarDaysAhead: 90,
  driveBackupFileName: 'sigma-life-os-backup-v47.json',

  // Public browser key restricted by HTTP referrer and Maps APIs.
  mapsApiKey: 'AIzaSyDN2I3We8eDMI5WvqMH5Piu_7GrftPZpdY',
  mapsDefaultCenter: { lat: 50.8503, lng: 4.3517 },
  mapsDefaultZoom: 11
});
