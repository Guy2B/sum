"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { OutlookMailConnector, normalizeMailMessage } = require("../../modules/connectors/outlook-mail-connector.js");

test("normalizes Outlook mail", () => {
  const item = normalizeMailMessage({
    id:"m1", subject:"Hello", bodyPreview:"Preview", isRead:false,
    from:{emailAddress:{address:"a@example.test",name:"A"}},
    toRecipients:[{emailAddress:{address:"b@example.test"}}],
    hasAttachments:true
  });
  assert.equal(item.id, "m1");
  assert.equal(item.from, "a@example.test");
  assert.deepEqual(item.to, ["b@example.test"]);
  assert.equal(item.source, "outlook-mail");
});

test("lists mail with pagination metadata", async () => {
  let request;
  const connector = new OutlookMailConnector({
    graphClient:{ async get(path, options){ request={path,options}; return {value:[{id:"m1"}], "@odata.nextLink":"next"}; } }
  });
  const result = await connector.listMessages();
  assert.equal(result.items.length, 1);
  assert.equal(result.nextCursor, "next");
  assert.match(request.path, /mailFolders/);
});
