"use strict";
(() => {
  const providers = [
    { id: "microsoft", name: "Microsoft / Outlook", detail: "Outlook, Calendar, Contacts et OneDrive", mode: "oauth" },
    { id: "yahoo", name: "Yahoo Mail", detail: "IMAP/SMTP via connecteur sécurisé", mode: "connector" },
    { id: "gmx", name: "GMX", detail: "IMAP/SMTP via connecteur sécurisé", mode: "connector" },
    { id: "icloud", name: "Apple iCloud Mail", detail: "Mot de passe d'application via connecteur sécurisé", mode: "connector" },
    { id: "imap", name: "Autre fournisseur IMAP", detail: "Serveur IMAP/SMTP personnalisé", mode: "connector" }
  ];
  const state = () => { try { return JSON.parse(localStorage.getItem("sigmaProvidersV48") || "{}"); } catch { return {}; } };
  const save = value => localStorage.setItem("sigmaProvidersV48", JSON.stringify(value));
  function target() { return document.getElementById("v48-other-accounts"); }
  function createTarget() {
    if (target()) return target();
    const google = document.querySelector(".v47-account-card");
    if (!google) return null;
    const section = document.createElement("section"); section.id = "v48-other-accounts"; section.className = "v48-provider-section";
    google.parentElement.append(section); return section;
  }
  function render() {
    const root = createTarget(); if (!root) return;
    const values = state();
    root.innerHTML = `<div class="v48-provider-heading"><div><h3>Ajouter un autre compte</h3><p>Une connexion par écosystème. Les mots de passe principaux ne sont jamais stockés dans GitHub.</p></div></div><div class="v48-provider-list">${providers.map(p => `<article><div class="v48-provider-icon">${p.id === "microsoft" ? "M" : p.id === "yahoo" ? "Y!" : p.id === "icloud" ? "" : p.id === "gmx" ? "GMX" : "@"}</div><div><strong>${p.name}</strong><small>${p.detail}</small></div><span class="status-chip ${values[p.id]?.connected ? "success" : ""}">${values[p.id]?.connected ? "Connecté" : p.mode === "oauth" ? "OAuth" : "Connecteur requis"}</span><button class="button secondary small" type="button" data-v48-provider="${p.id}">${values[p.id]?.connected ? "Synchroniser" : "Connecter"}</button></article>`).join("")}</div>`;
  }
  async function microsoft() {
    if (!window.SigmaMicrosoft?.configured?.()) return alert("Ajoutez d'abord microsoftClientId dans platform-config.js. Consultez V4.8-MULTI-PROVIDERS.md.");
    try {
      const results = await window.SigmaMicrosoft.connectAll();
      const profile = results.profile.data;
      const values = state(); values.microsoft = { connected: true, email: profile.mail || profile.userPrincipalName, name: profile.displayName, services: Object.fromEntries(Object.entries(results).filter(([k]) => k !== "profile").map(([k,v]) => [k, v.ok])), lastSync: new Date().toISOString() }; save(values); render();
      alert(`Microsoft connecté : ${values.microsoft.email}`);
    } catch (error) { alert(`Microsoft : ${error.message}`); }
  }
  function connector(provider) {
    const cfg = window.SIGMA_PLATFORM_CONFIG || {};
    if (!cfg.mailConnectorBaseUrl) return alert(`Le connecteur sécurisé n'est pas encore déployé. Consultez backend/mail-connector et V4.8-MULTI-PROVIDERS.md pour connecter ${provider.toUpperCase()}.`);
    const url = `${String(cfg.mailConnectorBaseUrl).replace(/\/$/,"")}/connect/${provider}`;
    window.open(url, "sigma-mail-connector", "width=620,height=760");
  }
  document.addEventListener("click", e => { const button=e.target.closest("[data-v48-provider]"); if (!button) return; const id=button.dataset.v48Provider; id === "microsoft" ? microsoft() : connector(id); });
  let renderScheduled = false;
  function scheduleRender() {
    if (renderScheduled || target()) return;
    renderScheduled = true;
    requestAnimationFrame(() => {
      renderScheduled = false;
      if (!target()) render();
    });
  }
  const observer = new MutationObserver(scheduleRender);
  observer.observe(document.documentElement, { subtree: true, childList: true });
  document.addEventListener("DOMContentLoaded", render);
})();
