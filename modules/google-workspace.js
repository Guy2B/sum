'use strict';
(() => {
  const cfg = window.SIGMA_GOOGLE_CLOUD_CONFIG || {};
  const scopes = {
    gmailRead: 'https://www.googleapis.com/auth/gmail.readonly',
    gmailSend: 'https://www.googleapis.com/auth/gmail.send',
    calendarRead: 'https://www.googleapis.com/auth/calendar.readonly',
    calendarWrite: 'https://www.googleapis.com/auth/calendar.events',
    drive: 'https://www.googleapis.com/auth/drive.appdata',
    youtube: 'https://www.googleapis.com/auth/youtube.readonly'
  };
  let gisPromise;
  const tokens = new Map();
  const configured = () => Boolean(cfg.oauthClientId && !String(cfg.oauthClientId).startsWith('REPLACE_'));

  function loadGis() {
    if (gisPromise) return gisPromise;
    gisPromise = new Promise((resolve, reject) => {
      if (window.google?.accounts?.oauth2) return resolve();
      const s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true;
      s.defer = true;
      s.onload = resolve;
      s.onerror = () => reject(new Error('Google Identity Services indisponible'));
      document.head.append(s);
    });
    return gisPromise;
  }

  async function getToken(scope) {
    if (!configured()) throw new Error('Ajoutez le Client ID OAuth dans google-cloud-config.js');
    if (tokens.has(scope)) return tokens.get(scope);
    await loadGis();
    return new Promise((resolve, reject) => {
      const client = google.accounts.oauth2.initTokenClient({
        client_id: cfg.oauthClientId,
        scope,
        callback: response => {
          if (response.error) return reject(new Error(response.error_description || response.error));
          tokens.set(scope, response.access_token);
          resolve(response.access_token);
        }
      });
      client.requestAccessToken({ prompt: 'consent' });
    });
  }

  async function api(url, options = {}, scope) {
    const access = await getToken(scope);
    const headers = { Authorization: `Bearer ${access}`, ...(options.headers || {}) };
    if (options.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.error?.message || `Google API ${response.status}`);
    }
    return response.status === 204 ? {} : response.json();
  }

  const header = (rows, name) => rows?.find(x => x.name?.toLowerCase() === name.toLowerCase())?.value || '';
  function utf8Base64Url(value) {
    const bytes = new TextEncoder().encode(value);
    let binary = '';
    bytes.forEach(byte => { binary += String.fromCharCode(byte); });
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  async function importGmail() {
    const max = Number(cfg.gmailMaxMessages) || 20;
    const list = await api(`https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${max}&q=${encodeURIComponent('newer_than:30d')}`, {}, scopes.gmailRead);
    const details = await Promise.all((list.messages || []).map(x => api(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${x.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`, {}, scopes.gmailRead)));
    return details.map(m => {
      const h = m.payload?.headers || [];
      return {
        id: `gmail-${m.id}`, externalId: m.id, accountId: 'google-gmail', provider: 'gmail',
        subject: header(h, 'Subject') || '(Sans objet)', sender: header(h, 'From'), snippet: m.snippet || '',
        receivedAt: new Date(Number(m.internalDate) || Date.now()).toISOString(), unread: (m.labelIds || []).includes('UNREAD'),
        importance: (m.labelIds || []).includes('IMPORTANT') ? 'high' : 'normal', needsReply: (m.labelIds || []).includes('UNREAD'),
        sourceUrl: `https://mail.google.com/mail/u/0/#inbox/${m.id}`
      };
    });
  }

  async function sendGmail({ to, subject = '', body = '', cc = '', bcc = '', replyTo = '' }) {
    if (!to) throw new Error('Destinataire requis');
    const lines = [`To: ${to}`];
    if (cc) lines.push(`Cc: ${cc}`);
    if (bcc) lines.push(`Bcc: ${bcc}`);
    if (replyTo) lines.push(`Reply-To: ${replyTo}`);
    lines.push(`Subject: ${subject}`, 'MIME-Version: 1.0', 'Content-Type: text/plain; charset=UTF-8', '', body);
    return api('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST', body: JSON.stringify({ raw: utf8Base64Url(lines.join('\r\n')) })
    }, scopes.gmailSend);
  }

  async function importCalendar() {
    const min = new Date().toISOString();
    const max = new Date(Date.now() + (Number(cfg.calendarDaysAhead) || 60) * 86400000).toISOString();
    const data = await api(`https://www.googleapis.com/calendar/v3/calendars/primary/events?singleEvents=true&orderBy=startTime&timeMin=${encodeURIComponent(min)}&timeMax=${encodeURIComponent(max)}&maxResults=100`, {}, scopes.calendarRead);
    return (data.items || []).map(e => {
      const start = e.start?.dateTime || e.start?.date || '';
      return { id: `gcal-${e.id}`, externalId: e.id, externalProvider: 'google', accountId: 'google-calendar', title: e.summary || '(Sans titre)', date: start.slice(0, 10), time: e.start?.dateTime ? start.slice(11, 16) : '', startAt: start, source: 'google-calendar', sourceUrl: e.htmlLink || '' };
    });
  }

  async function createCalendarEvent({ summary, description = '', location = '', start, end, timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone, attendees = [] }) {
    if (!summary || !start || !end) throw new Error('Titre, début et fin requis');
    const timed = String(start).includes('T');
    const payload = {
      summary, description, location,
      start: timed ? { dateTime: start, timeZone } : { date: start },
      end: timed ? { dateTime: end, timeZone } : { date: end },
      attendees: attendees.filter(Boolean).map(email => ({ email }))
    };
    return api('https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all', { method: 'POST', body: JSON.stringify(payload) }, scopes.calendarWrite);
  }

  async function findDriveFile() {
    const q = encodeURIComponent(`name='${cfg.driveBackupFileName || 'sigma-life-os-backup.json'}' and trashed=false`);
    const d = await api(`https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=${q}&fields=files(id,name,modifiedTime)&pageSize=1`, {}, scopes.drive);
    return d.files?.[0] || null;
  }
  async function pushDrive(state) {
    const file = await findDriveFile();
    const metadata = { name: cfg.driveBackupFileName || 'sigma-life-os-backup.json', ...(file ? {} : { parents: ['appDataFolder'] }) };
    const boundary = `sigma_${Date.now()}`;
    const body = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n${JSON.stringify(state)}\r\n--${boundary}--`;
    const url = file ? `https://www.googleapis.com/upload/drive/v3/files/${file.id}?uploadType=multipart` : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
    return api(url, { method: file ? 'PATCH' : 'POST', headers: { 'Content-Type': `multipart/related; boundary=${boundary}` }, body }, scopes.drive);
  }
  async function pullDrive() {
    const file = await findDriveFile();
    if (!file) throw new Error('Aucune sauvegarde Drive');
    return api(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`, {}, scopes.drive);
  }

  async function importYouTube() {
    const data = await api('https://www.googleapis.com/youtube/v3/subscriptions?part=snippet&mine=true&maxResults=25', {}, scopes.youtube);
    return (data.items || []).map(item => ({ id: item.id, title: item.snippet?.title || '', description: item.snippet?.description || '', thumbnail: item.snippet?.thumbnails?.default?.url || '', channelId: item.snippet?.resourceId?.channelId || '' }));
  }

  async function geminiRewrite(payload) {
    const url = String(cfg.appsScriptAiProxyUrl || '').trim();
    if (!url) return '';
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'geminiRewrite', ...payload }) });
    if (!r.ok) return '';
    const d = await r.json().catch(() => ({}));
    return String(d.text || '').trim();
  }

  function disconnect() {
    for (const token of tokens.values()) window.google?.accounts?.oauth2?.revoke(token, () => {});
    tokens.clear();
  }

  window.SigmaGoogle = { configured, importGmail, sendGmail, importCalendar, createCalendarEvent, pushDrive, pullDrive, importYouTube, geminiRewrite, disconnect };

  document.addEventListener('click', async e => {
    const push = e.target.closest('#sync-push');
    const pull = e.target.closest('#sync-pull');
    if (!push && !pull) return;
    if (!configured()) return;
    e.preventDefault(); e.stopImmediatePropagation();
    try {
      if (push) {
        await pushDrive(JSON.parse(localStorage.getItem(window.SUM_CONFIG.storageKey) || '{}'));
        window.dispatchEvent(new CustomEvent('sigma:google-toast', { detail: 'Sauvegarde Google Drive terminée.' }));
      } else {
        const state = await pullDrive();
        window.dispatchEvent(new CustomEvent('sigma:drive-state', { detail: { state } }));
        window.dispatchEvent(new CustomEvent('sigma:google-toast', { detail: 'Sauvegarde Google Drive restaurée.' }));
      }
    } catch (err) {
      window.dispatchEvent(new CustomEvent('sigma:google-toast', { detail: `Google Drive : ${err.message}`, error: true }));
    }
  }, true);
})();
