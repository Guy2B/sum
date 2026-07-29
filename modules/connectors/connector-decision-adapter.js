"use strict";

const TYPE_MAP = Object.freeze({
  "outlook-mail": "communication",
  "outlook-calendar": "calendar",
  "outlook-contacts": "relationship",
});

function toDecisionSignal(item, options = {}) {
  if (!item || typeof item !== "object") throw new TypeError("Connector item is required.");
  const source = item.source || options.source || "unknown";
  return {
    id: item.id,
    source,
    category: TYPE_MAP[source] || options.category || "external",
    occurredAt: item.receivedAt || item.start || item.timestamp || null,
    title: item.subject || item.title || item.displayName || "",
    importance: item.importance || "normal",
    entityId: item.conversationId || item.organizer || item.id || null,
    facts: {
      isRead: item.isRead,
      hasAttachments: item.hasAttachments,
      attendees: item.attendees,
      from: item.from,
      location: item.location,
    },
    provenance: {
      connector: source,
      rawId: item.id,
    },
  };
}

function adaptConnectorItems(items, options = {}) {
  return (items || []).map((item) => toDecisionSignal(item, options));
}

function createDecisionInput({ signals = [], health = [], syncedAt = null }) {
  return {
    version: 1,
    generatedAt: syncedAt || new Date().toISOString(),
    connectorSignals: signals,
    connectorHealth: health,
  };
}

module.exports = { TYPE_MAP, toDecisionSignal, adaptConnectorItems, createDecisionInput };
