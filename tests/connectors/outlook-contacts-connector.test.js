"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { OutlookContactsConnector, normalizeContact } = require("../../modules/connectors/outlook-contacts-connector.js");

test("normalizes and deduplicates contact channels", () => {
  const contact = normalizeContact({
    id:"c1", displayName:"Guy", emailAddresses:[{address:"g@example.test"},{address:"g@example.test"}],
    businessPhones:["1"], mobilePhone:"2"
  });
  assert.deepEqual(contact.emails, ["g@example.test"]);
  assert.deepEqual(contact.phones, ["1","2"]);
});

test("lists contacts", async () => {
  const connector = new OutlookContactsConnector({graphClient:{async get(){return {value:[{id:"c1"}]};}}});
  const result = await connector.listContacts();
  assert.equal(result.items.length, 1);
});
