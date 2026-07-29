"use strict";

function normalizeContact(contact) {
  if (!contact || typeof contact !== "object" || !contact.id) {
    throw new TypeError("Outlook contact must contain an id.");
  }
  const emails = (contact.emailAddresses || []).map((item) => item.address).filter(Boolean);
  const phones = [
    ...(contact.businessPhones || []),
    ...(contact.homePhones || []),
    ...(contact.mobilePhone ? [contact.mobilePhone] : []),
  ].filter(Boolean);

  return {
    id: String(contact.id),
    displayName: contact.displayName || "",
    givenName: contact.givenName || "",
    surname: contact.surname || "",
    company: contact.companyName || null,
    jobTitle: contact.jobTitle || null,
    emails: [...new Set(emails)],
    phones: [...new Set(phones)],
    birthday: contact.birthday || null,
    source: "outlook-contacts",
    raw: contact,
  };
}

class OutlookContactsConnector {
  constructor({ graphClient, pageSize = 100 }) {
    if (!graphClient || typeof graphClient.get !== "function") {
      throw new TypeError("Graph client must implement get(path, options).");
    }
    this.graphClient = graphClient;
    this.pageSize = pageSize;
  }

  async listContacts({ cursor = null } = {}) {
    const path = cursor || "/me/contacts";
    const response = await this.graphClient.get(path, {
      query: cursor ? undefined : {
        "$top": this.pageSize,
        "$orderby": "displayName",
      },
    });
    return {
      items: (response.value || []).map(normalizeContact),
      nextCursor: response["@odata.nextLink"] || null,
      deltaCursor: response["@odata.deltaLink"] || null,
    };
  }
}

module.exports = { OutlookContactsConnector, normalizeContact };
