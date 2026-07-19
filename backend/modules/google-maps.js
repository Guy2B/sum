"use strict";
(() => {
  const cfg = window.SIGMA_GOOGLE_CLOUD_CONFIG || {};
  let loader;
  let map;
  let marker;
  let directionsRenderer;

  const configured = () => Boolean(cfg.mapsApiKey && !String(cfg.mapsApiKey).startsWith("REPLACE_"));
  function load() {
    if (!configured()) return Promise.reject(new Error("Clé Google Maps non configurée"));
    if (window.google?.maps) return Promise.resolve(window.google.maps);
    if (loader) return loader;
    loader = new Promise((resolve, reject) => {
      const callback = `sigmaMapsReady_${Date.now()}`;
      window[callback] = () => { delete window[callback]; resolve(window.google.maps); };
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(cfg.mapsApiKey)}&libraries=places&callback=${callback}&loading=async`;
      script.async = true;
      script.onerror = () => reject(new Error("Chargement Google Maps impossible"));
      document.head.append(script);
    });
    return loader;
  }
  async function init(container) {
    await load();
    const center = cfg.mapsDefaultCenter || { lat: 50.8503, lng: 4.3517 };
    map = new google.maps.Map(container, { center, zoom: Number(cfg.mapsDefaultZoom) || 11, mapTypeControl: false, streetViewControl: false, fullscreenControl: true });
    directionsRenderer = new google.maps.DirectionsRenderer({ map });
    return map;
  }
  async function search(query) {
    if (!map) throw new Error("Carte non initialisée");
    return new Promise((resolve, reject) => {
      const service = new google.maps.places.PlacesService(map);
      service.findPlaceFromQuery({ query, fields: ["name", "formatted_address", "geometry", "place_id"] }, (results, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK || !results?.[0]) return reject(new Error("Lieu introuvable"));
        const place = results[0];
        map.panTo(place.geometry.location); map.setZoom(15);
        marker?.setMap(null);
        marker = new google.maps.Marker({ map, position: place.geometry.location, title: place.name });
        resolve({ name: place.name, address: place.formatted_address, placeId: place.place_id, lat: place.geometry.location.lat(), lng: place.geometry.location.lng() });
      });
    });
  }
  async function route(origin, destination, mode = "DRIVING") {
    if (!map) throw new Error("Carte non initialisée");
    const service = new google.maps.DirectionsService();
    const result = await service.route({ origin, destination, travelMode: google.maps.TravelMode[mode] || google.maps.TravelMode.DRIVING });
    directionsRenderer.setDirections(result);
    const leg = result.routes?.[0]?.legs?.[0];
    return { distance: leg?.distance?.text || "", duration: leg?.duration?.text || "", start: leg?.start_address || "", end: leg?.end_address || "" };
  }
  window.SigmaMaps = { configured, load, init, search, route };
})();
