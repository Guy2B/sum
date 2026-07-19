"use strict";
(() => {
  const storageKey = "sigmaGoogleAccountV47";
  const readMeta = () => { try { return JSON.parse(localStorage.getItem(storageKey) || "{}"); } catch { return {}; } };
  const saveMeta = value => localStorage.setItem(storageKey, JSON.stringify(value));
  const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"})[char]);
  const statusRow = (label, state, detail = "") => `<li><span class="v47-service-dot ${state}"></span><div><strong>${esc(label)}</strong>${detail ? `<small>${esc(detail)}</small>` : ""}</div><span>${state === "ok" ? "Connecté" : state === "error" ? "À vérifier" : "À autoriser"}</span></li>`;

  function setAppState(tests) {
    if (!window.SigmaApp?.updateState) return;
    const update = window.SigmaApp.updateState;
    update(state => {
      state.googleServices = state.googleServices || {};
      for (const key of ["gmail", "calendar", "drive", "youtube", "contacts"]) state.googleServices[key] = { connected: Boolean(tests[key]?.ok), lastSync: new Date().toISOString(), error: tests[key]?.error || "" };
      if (tests.gmail?.ok) {
        state.mailAccounts = (state.mailAccounts || []).filter(x => x.provider !== "gmail" || !x.demo);
        if (!state.mailAccounts.some(x => x.id === "google-gmail")) state.mailAccounts.unshift({ id: "google-gmail", provider: "gmail", email: tests.profile?.data?.email || "Compte Google", status: "connected" });
        state.mailMessages = [...tests.gmail.data, ...(state.mailMessages || []).filter(x => x.provider !== "gmail")];
      }
      if (tests.calendar?.ok) {
        state.calendarAccounts = (state.calendarAccounts || []).filter(x => x.provider !== "google");
        state.calendarAccounts.unshift({ id: "google-calendar", provider: "google", email: tests.profile?.data?.email || "Compte Google", status: "connected" });
        state.events = [...tests.calendar.data, ...(state.events || []).filter(x => x.externalProvider !== "google")];
      }
      if (tests.contacts?.ok) state.googleContacts = tests.contacts.data;
      if (tests.youtube?.ok) state.youtubeSubscriptions = tests.youtube.data;
    });
  }

  function render() {
    const target = document.getElementById("v46-google-services");
    if (!target) return;
    const meta = readMeta();
    const services = meta.services || {};
    target.classList.add("v47-account-hub");
    target.innerHTML = `<article class="v47-account-card">
      <header><div class="v47-google-mark">G</div><div><h3>Google</h3><p>${esc(meta.email || "Une connexion pour tout votre écosystème Google")}</p></div><span class="status-chip ${meta.connected ? "success" : ""}">${meta.connected ? "Connecté" : "Non connecté"}</span></header>
      <ul class="v47-service-list">
        ${statusRow("Gmail", services.gmail || "pending", "Messages et envoi")}
        ${statusRow("Google Calendar", services.calendar || "pending", "Agenda bidirectionnel")}
        ${statusRow("Google Drive", services.drive || "pending", "Sauvegarde privée")}
        ${statusRow("YouTube", services.youtube || "pending", "Abonnements et apprentissage")}
        ${statusRow("Google Contacts", services.contacts || "pending", "Relations et contexte")}
        ${statusRow("Google Maps", window.SigmaMaps?.configured?.() ? "ok" : "pending", "Lieux, recherche et itinéraires")}
      </ul>
      <footer><button type="button" class="button primary" data-v47-google-connect>${meta.connected ? "Vérifier et synchroniser" : "Continuer avec Google"}</button><button type="button" class="button secondary" data-v47-open-maps>Ouvrir Maps</button>${meta.connected ? '<button type="button" class="button ghost" data-v47-google-disconnect>Déconnecter</button>' : ""}</footer>
      <p class="v47-account-note">Sigma utilise ces services comme sources de contexte pour votre accompagnateur. Chaque service reste révocable séparément dans votre compte Google.</p>
    </article>`;
  }

  function ensureModal() {
    let modal = document.getElementById("v47-maps-modal");
    if (modal) return modal;
    modal = document.createElement("div");
    modal.id = "v47-maps-modal";
    modal.className = "v47-modal";
    modal.hidden = true;
    modal.innerHTML = `<div class="v47-modal-panel" role="dialog" aria-modal="true" aria-labelledby="v47-map-title"><header><div><h2 id="v47-map-title">Google Maps</h2><p>Lieux et trajets utiles à votre journée.</p></div><button type="button" class="icon-button" data-v47-map-close aria-label="Fermer">×</button></header><div class="v47-map-controls"><label>Rechercher un lieu<input id="v47-map-query" placeholder="Client, adresse, restaurant…"></label><button type="button" class="button primary" data-v47-map-search>Rechercher</button></div><div class="v47-route-controls"><label>Départ<input id="v47-route-origin" placeholder="Votre adresse ou lieu"></label><label>Destination<input id="v47-route-destination" placeholder="Destination"></label><button type="button" class="button secondary" data-v47-map-route>Calculer le trajet</button></div><div id="v47-map-canvas" class="v47-map-canvas"></div><p id="v47-map-result" class="v47-map-result" aria-live="polite"></p></div>`;
    document.body.append(modal);
    return modal;
  }

  async function connect() {
    const button = document.querySelector("[data-v47-google-connect]");
    if (button) { button.disabled = true; button.textContent = "Connexion et vérification…"; }
    try {
      const tests = await window.SigmaGoogle.connectAll();
      setAppState(tests);
      const meta = { connected: true, email: tests.profile?.data?.email || "Compte Google", name: tests.profile?.data?.name || "", lastSync: new Date().toISOString(), services: {} };
      for (const key of ["gmail", "calendar", "drive", "youtube", "contacts"]) meta.services[key] = tests[key]?.ok ? "ok" : "error";
      saveMeta(meta); render();
    } catch (error) { alert(`Google : ${error.message}`); render(); }
  }

  async function openMaps() {
    if (!window.SigmaMaps?.configured?.()) {
      alert("Ajoutez d’abord mapsApiKey dans google-cloud-config.js. Le fichier GUIDE-CLE-GOOGLE-MAPS.md contient les étapes.");
      return;
    }
    const modal = ensureModal(); modal.hidden = false;
    try { await window.SigmaMaps.init(document.getElementById("v47-map-canvas")); }
    catch (error) { document.getElementById("v47-map-result").textContent = error.message; }
  }

  document.addEventListener("click", async event => {
    if (event.target.closest("[data-v47-google-connect]")) return connect();
    if (event.target.closest("[data-v47-google-disconnect]")) { window.SigmaGoogle.disconnect(); localStorage.removeItem(storageKey); render(); return; }
    if (event.target.closest("[data-v47-open-maps]")) return openMaps();
    if (event.target.closest("[data-v47-map-close]")) { ensureModal().hidden = true; return; }
    if (event.target.closest("[data-v47-map-search]")) {
      const result = document.getElementById("v47-map-result"); result.textContent = "Recherche…";
      try { const place = await window.SigmaMaps.search(document.getElementById("v47-map-query").value); result.textContent = `${place.name} — ${place.address}`; } catch (error) { result.textContent = error.message; }
    }
    if (event.target.closest("[data-v47-map-route]")) {
      const result = document.getElementById("v47-map-result"); result.textContent = "Calcul du trajet…";
      try { const route = await window.SigmaMaps.route(document.getElementById("v47-route-origin").value, document.getElementById("v47-route-destination").value); result.textContent = `${route.distance} · environ ${route.duration}`; } catch (error) { result.textContent = error.message; }
    }
  });
  window.addEventListener("sigma:state-changed", render);
  const observer = new MutationObserver(() => { if (document.getElementById("v46-google-services") && !document.querySelector(".v47-account-card")) render(); });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener("DOMContentLoaded", render);
})();
