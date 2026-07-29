"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { OutlookCalendarConnector, normalizeCalendarEvent } = require("../../modules/connectors/outlook-calendar-connector.js");

test("normalizes Outlook event", () => {
  const event = normalizeCalendarEvent({
    id:"e1", subject:"Review", start:{dateTime:"2026-07-29T10:00:00",timeZone:"Europe/Paris"},
    end:{dateTime:"2026-07-29T11:00:00",timeZone:"Europe/Paris"},
    attendees:[{emailAddress:{address:"a@example.test"},status:{response:"accepted"}}]
  });
  assert.equal(event.title, "Review");
  assert.equal(event.attendees[0].status, "accepted");
  assert.equal(event.source, "outlook-calendar");
});

test("calendar view requires a range", async () => {
  const connector = new OutlookCalendarConnector({graphClient:{async get(){return {value:[]};}}});
  await assert.rejects(() => connector.listCalendarView({}), /start and end/);
});
