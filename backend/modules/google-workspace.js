"use strict";
(() => {
  const cfg = window.SIGMA_GOOGLE_CLOUD_CONFIG || {};
  const scopes = Object.freeze({
    profile: "openid email profile",
    gmailRead: "https://www.googleapis.com/auth/gmail.readonly",
    gmailSend: "https://www.googleapis.com/auth/gmail.send",
    calendarRead: "https://www.googleapis.com/auth/calendar.readonly",
    calendarWrite: "https://www.googleapis.com/auth/calendar.events",
    drive: "https://www.googleapis.com/auth/drive.appdata",
    youtube: "https://www.googleapis.com/auth/youtube.readonly",
    contacts: "https://www.googleapis.com/auth/contacts.readonly"
  });
  const allScopes = Object.values(scopes).join(" ");
  let gisPromise;
  let accessToken = "";
  let grantedScopes = new Set();

  const configured = () => Boolean(cfg.oauthClientId && !String(cfg.oauthClientId).startsWith("REPLACE_"));
  const emit = (name, detail = {}) => window.dispatchEvent(new CustomEvent(name, { detail }));

  function loadGis() {
    if (gisPromise) return gisPromise;
    gisPromise = new Promise((resolve, reject) => {
      if (window.google?.accounts?.oauth2) return resolve();
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error("Google Identity Services indisponible"));
      document.head.append(script);
    });
    return gisPromise;
  }

  async function requestToken(scope = allScopes, prompt = "consent") {
    if (!configured()) throw new Error("Ajoutez le Client ID OAuth dans google-cloud-config.js");
    await loadGis();
    return new Promise((resolve, reject) => {
      const client = google.accounts.oauth2.initTokenClient({
        client_id: cfg.oauthClientId,
        scope,
        include_granted_scopes: true,
        callback: response => {
          if (response.error) return reject(new Error(response.error_description || response.error));
          accessToken = response.access_token;
          grantedScopes = new Set(String(response.scope || scope).split(/\s+/).filter(Boolean));
          emit("sigma:google-auth", { connected: true, scopes: [...grantedScopes] });
          resolve(accessToken);
        }
      });
      client.requestAccessToken({ prompt });
    });
  }

  async function getToken(scope) {
    if (accessToken && (!scope || grantedScopes.has(scope))) return accessToken;
    return requestToken(scope || allScopes, accessToken ? "" : "consent");
  }

  async function api(url, options = {}, scope) {
    const token = await getToken(scope);
    const headers = { Authorization: `Bearer ${token}`, ...(options.headers || {}) };
    if (options.body && !headers["Content-Type"]) headers["Content-Type"] = "application/json";
    let response = await fetch(url, { ...options, headers });
    if (response.status === 401) {
      accessToken = "";
      const renewed = await requestToken(scope || allScopes, "");
      response = await fetch(url, { ...options, headers: { ...headers, Authorization: `Bearer ${renewed}` } });
    }
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.error?.message || `Google API ${response.status}`);
    }
    if (response.status === 204) return {};
    const type = response.headers.get("content-type") || "";
    return type.includes("json") ? response.json() : response.text();
  }

  const header = (rows, name) => rows?.find(x => x.name?.toLowerCase() === name.toLowerCase())?.value || "";
  function utf8Base64Url(value) {
    const bytes = new TextEncoder().encode(value);
    let binary = "";
    bytes.forEach(byte => { binary += String.fromCharCode(byte); });
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  async function getProfile() {
    const data = await api("https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses,photos", {}, scopes.contacts);
    return {
      name: data.names?.[0]?.displayName || "Compte Google",
      email: data.emailAddresses?.[0]?.value || "",
      photo: data.photos?.[0]?.url || ""
    };
  }

  async function importGmail() {
    const max = Number(cfg.gmailMaxMessages) || 30;
    const list = await api(`https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${max}&q=${encodeURIComponent("newer_than:30d")}`, {}, scopes.gmailRead);
    const details = await Promise.all((list.messages || []).map(x => api(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${x.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`, {}, scopes.gmailRead)));
    return details.map(m => {
      const h = m.payload?.headers || [];
      return {
        id: `gmail-${m.id}`, externalId: m.id, accountId: "google-gmail", provider: "gmail",
        subject: header(h, "Subject") || "(Sans objet)", sender: header(h, "From"), snippet: m.snippet || "",
        receivedAt: new Date(Number(m.internalDate) || Date.now()).toISOString(), unread: (m.labelIds || []).includes("UNREAD"),
        importance: (m.labelIds || []).includes("IMPORTANT") ? "high" : "normal", needsReply: (m.labelIds || []).includes("UNREAD"),
        sourceUrl: `https://mail.google.com/mail/u/0/#inbox/${m.id}`
      };
    });
  }

  async function sendGmail({ to, subject = "", body = "", cc = "", bcc = "", replyTo = "" }) {
    if (!to) throw new Error("Destinataire requis");
    const lines = [`To: ${to}`];
    if (cc) lines.push(`Cc: ${cc}`);
    if (bcc) lines.push(`Bcc: ${bcc}`);
    if (replyTo) lines.push(`Reply-To: ${replyTo}`);
    lines.push(`Subject: ${subject}`, "MIME-Version: 1.0", "Content-Type: text/plain; charset=UTF-8", "", body);
    return api("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", { method: "POST", body: JSON.stringify({ raw: utf8Base64Url(lines.join("\r\n")) }) }, scopes.gmailSend);
  }

  async function importCalendar() {
    const min = new Date().toISOString();
    const max = new Date(Date.now() + (Number(cfg.calendarDaysAhead) || 90) * 86400000).toISOString();
    const data = await api(`https://www.googleapis.com/calendar/v3/calendars/primary/events?singleEvents=true&orderBy=startTime&timeMin=${encodeURIComponent(min)}&timeMax=${encodeURIComponent(max)}&maxResults=150`, {}, scopes.calendarRead);
    return (data.items || []).map(e => {
      const start = e.start?.dateTime || e.start?.date || "";
      return { id: `gcal-${e.id}`, externalId: e.id, externalProvider: "google", accountId: "google-calendar", title: e.summary || "(Sans titre)", date: start.slice(0, 10), time: e.start?.dateTime ? start.slice(11, 16) : "", startAt: start, endAt: e.end?.dateTime || e.end?.date || "", location: e.location || "", source: "google-calendar", sourceUrl: e.htmlLink || "" };
    });
  }

  async function createCalendarEvent({ summary, description = "", location = "", start, end, timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone, attendees = [] }) {
    if (!summary || !start || !end) throw new Error("Titre, début et fin requis");
    const timed = String(start).includes("T");
    const payload = { summary, description, location, start: timed ? { dateTime: start, timeZone } : { date: start }, end: timed ? { dateTime: end, timeZone } : { date: end }, attendees: attendees.filter(Boolean).map(email => ({ email })) };
    return api("https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all", { method: "POST", body: JSON.stringify(payload) }, scopes.calendarWrite);
  }
  async function updateCalendarEvent(eventId, patch) {
    if (!eventId) throw new Error("Identifiant événement requis");
    return api(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(eventId)}?sendUpdates=all`, { method: "PATCH", body: JSON.stringify(patch) }, scopes.calendarWrite);
  }
  async function deleteCalendarEvent(eventId) {
    if (!eventId) throw new Error("Identifiant événement requis");
    return api(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(eventId)}?sendUpdates=all`, { method: "DELETE" }, scopes.calendarWrite);
  }

  async function findDriveFile() {
    const q = encodeURIComponent(`name='${cfg.driveBackupFileName || "sigma-life-os-backup.json"}' and trashed=false`);
    const data = await api(`https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=${q}&fields=files(id,name,modifiedTime)&pageSize=1`, {}, scopes.drive);
    return data.files?.[0] || null;
  }
  async function pushDrive(state) {
    const file = await findDriveFile();
    const metadata = { name: cfg.driveBackupFileName || "sigma-life-os-backup.json", ...(file ? {} : { parents: ["appDataFolder"] }) };
    const boundary = `sigma_${Date.now()}`;
    const body = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n${JSON.stringify(state)}\r\n--${boundary}--`;
    const url = file ? `https://www.googleapis.com/upload/drive/v3/files/${file.id}?uploadType=multipart` : "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart";
    return api(url, { method: file ? "PATCH" : "POST", headers: { "Content-Type": `multipart/related; boundary=${boundary}` }, body }, scopes.drive);
  }
  async function pullDrive() {
    const file = await findDriveFile();
    if (!file) throw new Error("Aucune sauvegarde Drive");
    return api(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`, {}, scopes.drive);
  }

  async function importYouTube() {
    const data = await api("https://www.googleapis.com/youtube/v3/subscriptions?part=snippet&mine=true&maxResults=50", {}, scopes.youtube);
    return (data.items || []).map(item => ({ id: item.id, title: item.snippet?.title || "", description: item.snippet?.description || "", thumbnail: item.snippet?.thumbnails?.default?.url || "", channelId: item.snippet?.resourceId?.channelId || "" }));
  }

  async function importContacts() {
    const data = await api("https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,phoneNumbers,organizations,photos&sortOrder=LAST_MODIFIED_DESCENDING&pageSize=250", {}, scopes.contacts);
    return (data.connections || []).map(person => ({
      id: person.resourceName || crypto.randomUUID(),
      name: person.names?.[0]?.displayName || person.emailAddresses?.[0]?.value || "Contact",
      email: person.emailAddresses?.[0]?.value || "",
      phone: person.phoneNumbers?.[0]?.value || "",
      company: person.organizations?.[0]?.name || "",
      role: person.organizations?.[0]?.title || "",
      photo: person.photos?.[0]?.url || "",
      provider: "google"
    }));
  }

  async function connectAll() {
    await requestToken(allScopes, "consent");
    const tests = {};
    const runners = {
      profile: () => getProfile(), gmail: () => importGmail(), calendar: () => importCalendar(),
      drive: () => findDriveFile(), youtube: () => importYouTube(), contacts: () => importContacts()
    };
    for (const [key, runner] of Object.entries(runners)) {
      try { const data = await runner(); tests[key] = { ok: true, data }; }
      catch (error) { tests[key] = { ok: false, error: error.message }; }
    }
    emit("sigma:google-connected", tests);
    return tests;
  }

  async function geminiRewrite(payload) {
    const url = String(cfg.appsScriptAiProxyUrl || "").trim();
    if (!url) return "";
    const response = await fetch(url, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ action: "geminiRewrite", ...payload }) });
    if (!response.ok) return "";
    const data = await response.json().catch(() => ({}));
    return String(data.text || "").trim();
  }

  function disconnect() {
    if (accessToken) window.google?.accounts?.oauth2?.revoke(accessToken, () => {});
    accessToken = "";
    grantedScopes.clear();
    emit("sigma:google-auth", { connected: false, scopes: [] });
  }

  window.SigmaGoogle = { configured, scopes, connectAll, getProfile, importGmail, sendGmail, importCalendar, createCalendarEvent, updateCalendarEvent, deleteCalendarEvent, pushDrive, pullDrive, importYouTube, importContacts, geminiRewrite, disconnect, getGrantedScopes: () => [...grantedScopes] };

  document.addEventListener("click", async event => {
    const push = event.target.closest("#sync-push");
    const pull = event.target.closest("#sync-pull");
    if (!push && !pull) return;
    if (!configured()) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    try {
      if (push) {
        await pushDrive(JSON.parse(localStorage.getItem(window.SUM_CONFIG.storageKey) || "{}"));
        emit("sigma:google-toast", "Sauvegarde Google Drive terminée.");
      } else {
        const state = await pullDrive();
        emit("sigma:drive-state", { state });
        emit("sigma:google-toast", "Sauvegarde Google Drive restaurée.");
      }
    } catch (error) { emit("sigma:google-toast", `Google Drive : ${error.message}`); }
  }, true);
})();
