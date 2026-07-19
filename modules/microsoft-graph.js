"use strict";
(() => {
  const cfg = window.SIGMA_PLATFORM_CONFIG || {};
  let msalPromise;
  let client;
  const scopes = ["User.Read", "Mail.Read", "Mail.Send", "Calendars.ReadWrite", "Contacts.Read", "Files.ReadWrite.AppFolder"];
  const configured = () => Boolean(cfg.microsoftClientId && !String(cfg.microsoftClientId).startsWith("REPLACE_"));
  function loadMsal() {
    if (window.msal?.PublicClientApplication) return Promise.resolve(window.msal);
    if (msalPromise) return msalPromise;
    msalPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/@azure/msal-browser@4.15.0/lib/msal-browser.min.js";
      script.onload = () => resolve(window.msal);
      script.onerror = () => reject(new Error("MSAL indisponible"));
      document.head.append(script);
    });
    return msalPromise;
  }
  async function instance() {
    if (!configured()) throw new Error("Ajoutez microsoftClientId dans platform-config.js");
    if (client) return client;
    await loadMsal();
    client = new msal.PublicClientApplication({ auth: { clientId: cfg.microsoftClientId, authority: `https://login.microsoftonline.com/${cfg.microsoftTenant || "common"}`, redirectUri: cfg.microsoftRedirectUri || location.origin + location.pathname }, cache: { cacheLocation: "sessionStorage" } });
    await client.initialize();
    return client;
  }
  async function token() {
    const app = await instance();
    let account = app.getAllAccounts()[0];
    if (!account) account = (await app.loginPopup({ scopes, prompt: "select_account" })).account;
    try { return (await app.acquireTokenSilent({ account, scopes })).accessToken; }
    catch { return (await app.acquireTokenPopup({ account, scopes })).accessToken; }
  }
  async function graph(path, options = {}) {
    const accessToken = await token();
    const response = await fetch(`https://graph.microsoft.com/v1.0${path}`, { ...options, headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json", ...(options.headers || {}) } });
    if (!response.ok) { const data = await response.json().catch(() => ({})); throw new Error(data.error?.message || `Microsoft Graph ${response.status}`); }
    return response.status === 204 ? {} : response.json();
  }
  async function connectAll() {
    const profile = await graph("/me?$select=displayName,mail,userPrincipalName");
    const results = { profile: { ok: true, data: profile } };
    const tests = {
      mail: () => graph("/me/messages?$top=30&$select=id,subject,from,receivedDateTime,isRead,importance,bodyPreview,webLink&$orderby=receivedDateTime desc"),
      calendar: () => graph(`/me/calendarView?startDateTime=${encodeURIComponent(new Date().toISOString())}&endDateTime=${encodeURIComponent(new Date(Date.now()+90*86400000).toISOString())}&$top=100&$select=id,subject,start,end,location,webLink`),
      contacts: () => graph("/me/contacts?$top=200&$select=id,displayName,emailAddresses,mobilePhone,businessPhones,companyName,jobTitle"),
      onedrive: () => graph("/me/drive/special/approot")
    };
    for (const [key, fn] of Object.entries(tests)) { try { results[key] = { ok: true, data: await fn() }; } catch (error) { results[key] = { ok: false, error: error.message }; } }
    return results;
  }
  async function sendMail({ to, subject, body, cc = [] }) {
    return graph("/me/sendMail", { method: "POST", body: JSON.stringify({ message: { subject, body: { contentType: "Text", content: body }, toRecipients: String(to).split(",").filter(Boolean).map(address => ({ emailAddress: { address: address.trim() } })), ccRecipients: cc.map(address => ({ emailAddress: { address } })) }, saveToSentItems: true }) });
  }
  async function createEvent(payload) { return graph("/me/events", { method: "POST", body: JSON.stringify(payload) }); }
  async function disconnect() { const app = await instance(); const account = app.getAllAccounts()[0]; if (account) await app.logoutPopup({ account }); }
  window.SigmaMicrosoft = { configured, connectAll, graph, sendMail, createEvent, disconnect };
})();
