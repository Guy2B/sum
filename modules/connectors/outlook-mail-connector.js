"use strict";

function assertGraphClient(client) {
  if (!client || typeof client.get !== "function") {
    throw new TypeError("Graph client must implement get(path, options).");
  }
}

function normalizeMailMessage(message) {
  if (!message || typeof message !== "object" || !message.id) {
    throw new TypeError("Outlook message must contain an id.");
  }

  return {
    id: String(message.id),
    subject: message.subject || "",
    preview: message.bodyPreview || "",
    receivedAt: message.receivedDateTime || null,
    sentAt: message.sentDateTime || null,
    isRead: Boolean(message.isRead),
    importance: message.importance || "normal",
    from: message.from?.emailAddress?.address || null,
    senderName: message.from?.emailAddress?.name || null,
    to: (message.toRecipients || []).map((item) => item.emailAddress?.address).filter(Boolean),
    hasAttachments: Boolean(message.hasAttachments),
    conversationId: message.conversationId || null,
    webLink: message.webLink || null,
    source: "outlook-mail",
    raw: message,
  };
}

class OutlookMailConnector {
  constructor({ graphClient, pageSize = 50 }) {
    assertGraphClient(graphClient);
    this.graphClient = graphClient;
    this.pageSize = pageSize;
  }

  async listMessages({ folder = "inbox", cursor = null, since = null } = {}) {
    const path = cursor || `/me/mailFolders/${encodeURIComponent(folder)}/messages`;
    const query = cursor ? undefined : {
      "$top": this.pageSize,
      "$orderby": "receivedDateTime desc",
      "$select": [
        "id","subject","bodyPreview","receivedDateTime","sentDateTime",
        "isRead","importance","from","toRecipients","hasAttachments",
        "conversationId","webLink"
      ].join(","),
      ...(since ? { "$filter": `receivedDateTime ge ${since}` } : {}),
    };

    const response = await this.graphClient.get(path, { query });
    return {
      items: (response.value || []).map(normalizeMailMessage),
      nextCursor: response["@odata.nextLink"] || null,
      deltaCursor: response["@odata.deltaLink"] || null,
    };
  }
}

module.exports = { OutlookMailConnector, normalizeMailMessage, assertGraphClient };
