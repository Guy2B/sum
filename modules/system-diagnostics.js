"use strict";
(() => {
  const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"})[ch]);
  const readJson = (key) => { try { return JSON.parse(localStorage.getItem(key) || "{}"); } catch { return {}; } };
  const statusLabel = state => state === "ok" ? "Opérationnel" : state === "warn" ? "À vérifier" : state === "off" ? "Non configuré" : "Non testé";
  const row = (name, state, detail = "") => `<li><span class="vdiag-dot ${state}"></span><div><strong>${esc(name)}</strong>${detail ? `<small>${esc(detail)}</small>` : ""}</div><span class="vdiag-state ${state}">${statusLabel(state)}</span></li>`;

  function snapshot() {
    const google = readJson("sigmaGoogleAccountV47");
    const providers = readJson("sigmaProvidersV48");
    const g = google.services || {};
    const mapsConfigured = Boolean(window.SigmaMaps?.configured?.());
    const firebaseConfigured = Boolean(window.SIGMA_FIREBASE_CONFIG?.apiKey && !String(window.SIGMA_FIREBASE_CONFIG.apiKey).startsWith("REPLACE_"));
    const googleConfigured = Boolean(window.SigmaGoogle?.configured?.());
    const microsoftConfigured = Boolean(window.SigmaMicrosoft?.configured?.());
    return {
      firebase: {
        auth: firebaseConfigured ? "ok" : "off",
        firestore: firebaseConfigured ? "ok" : "off",
        storage: firebaseConfigured ? "ok" : "off"
      },
      google: {
        oauth: googleConfigured ? (google.connected ? "ok" : "warn") : "off",
        gmail: g.gmail || "idle",
        calendar: g.calendar || "idle",
        drive: g.drive || "idle",
        youtube: g.youtube || "idle",
        contacts: g.contacts || "idle",
        maps: mapsConfigured ? "warn" : "off"
      },
      providers: {
        microsoft: providers.microsoft?.connected ? "ok" : microsoftConfigured ? "warn" : "off",
        yahoo: providers.yahoo?.connected ? "ok" : "off",
        gmx: providers.gmx?.connected ? "ok" : "off",
        icloud: providers.icloud?.connected ? "ok" : "off",
        imap: providers.imap?.connected ? "ok" : "off"
      },
      email: google.email || providers.microsoft?.email || ""
    };
  }

  function normalize(value) {
    if (value === "ok") return "ok";
    if (value === "error") return "warn";
    if (value === "pending" || value === "idle") return "idle";
    return value || "idle";
  }

  function ensureModal() {
    let modal = document.getElementById("vdiag-modal");
    if (modal) return modal;
    modal = document.createElement("div");
    modal.id = "vdiag-modal";
    modal.className = "v47-modal vdiag-modal";
    modal.hidden = true;
    modal.innerHTML = `<div class="v47-modal-panel vdiag-panel" role="dialog" aria-modal="true" aria-labelledby="vdiag-title">
      <header><div><h2 id="vdiag-title">Diagnostic administrateur</h2><p>État réel ou dernier état vérifié des services Sigma.</p></div><button type="button" class="icon-button" data-vdiag-close aria-label="Fermer">×</button></header>
      <div id="vdiag-content"></div>
      <footer class="vdiag-actions"><button type="button" class="button primary" data-vdiag-test-google>Tester Google maintenant</button><button type="button" class="button secondary" data-vdiag-refresh>Actualiser l’état</button></footer>
      <p class="v47-account-note">Un service est marqué opérationnel seulement après une vérification réussie. Le test Google peut rouvrir la fenêtre de consentement si une autorisation manque.</p>
    </div>`;
    document.body.append(modal);
    return modal;
  }

  function renderModal(message = "") {
    const data = snapshot();
    const root = ensureModal().querySelector("#vdiag-content");
    root.innerHTML = `${message ? `<div class="vdiag-message">${esc(message)}</div>` : ""}
      <section class="vdiag-group"><h3>Firebase</h3><ul>${row("Authentification", data.firebase.auth, "Connexion au compte Sigma")}${row("Firestore", data.firebase.firestore, "Synchronisation des données")}${row("Storage", data.firebase.storage, "Fichiers et sauvegardes")}</ul></section>
      <section class="vdiag-group"><h3>Google${data.email ? ` · ${esc(data.email)}` : ""}</h3><ul>
        ${row("OAuth", normalize(data.google.oauth), "Client Google et consentement")}
        ${row("Gmail", normalize(data.google.gmail), "Lecture et envoi")}
        ${row("Google Calendar", normalize(data.google.calendar), "Lecture et création")}
        ${row("Google Drive", normalize(data.google.drive), "Sauvegarde appDataFolder")}
        ${row("YouTube", normalize(data.google.youtube), "Abonnements")}
        ${row("Google Contacts", normalize(data.google.contacts), "People API")}
        ${row("Google Maps", normalize(data.google.maps), data.google.maps === "off" ? "Clé Maps absente" : "Clé présente, test de chargement requis")}
      </ul></section>
      <section class="vdiag-group"><h3>Autres fournisseurs</h3><ul>
        ${row("Microsoft / Outlook", normalize(data.providers.microsoft), "OAuth Microsoft Graph")}
        ${row("Yahoo", normalize(data.providers.yahoo), "Connecteur IMAP/SMTP")}
        ${row("GMX", normalize(data.providers.gmx), "Connecteur IMAP/SMTP")}
        ${row("Apple iCloud", normalize(data.providers.icloud), "Connecteur IMAP/SMTP")}
        ${row("Autre IMAP", normalize(data.providers.imap), "Connecteur générique")}
      </ul></section>`;
  }

  function injectButton() {
    const target = document.querySelector(".v47-account-card footer");
    if (!target || target.querySelector("[data-vdiag-open]")) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "button ghost";
    button.dataset.vdiagOpen = "";
    button.textContent = "Diagnostic";
    target.append(button);
  }

  async function testGoogle() {
    renderModal("Vérification Google en cours…");
    try {
      const tests = await window.SigmaGoogle.connectAll();
      const current = readJson("sigmaGoogleAccountV47");
      const services = {};
      for (const key of ["gmail", "calendar", "drive", "youtube", "contacts"]) services[key] = tests[key]?.ok ? "ok" : "error";
      const meta = {
        ...current,
        connected: true,
        email: tests.profile?.data?.email || current.email || "Compte Google",
        name: tests.profile?.data?.name || current.name || "",
        lastSync: new Date().toISOString(),
        services
      };
      localStorage.setItem("sigmaGoogleAccountV47", JSON.stringify(meta));
      let mapsMessage = "";
      if (window.SigmaMaps?.configured?.()) {
        try { await window.SigmaMaps.load(); mapsMessage = " Google Maps chargé correctement."; }
        catch (error) { mapsMessage = ` Google Maps : ${error.message}.`; }
      }
      window.dispatchEvent(new CustomEvent("sigma:state-changed"));
      renderModal(`Test terminé.${mapsMessage}`);
    } catch (error) {
      renderModal(`Échec du test : ${error.message}`);
    }
  }

  document.addEventListener("click", event => {
    if (event.target.closest("[data-vdiag-open]")) { ensureModal().hidden = false; renderModal(); }
    if (event.target.closest("[data-vdiag-close]")) ensureModal().hidden = true;
    if (event.target.closest("[data-vdiag-refresh]")) renderModal();
    if (event.target.closest("[data-vdiag-test-google]")) testGoogle();
  });

  const observer = new MutationObserver(injectButton);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener("DOMContentLoaded", injectButton);
  window.SigmaDiagnostics = { open: () => { ensureModal().hidden = false; renderModal(); }, snapshot };
})();
