"use strict";

function normalizeAttendees(attendees = []) {
  return attendees.map((entry) => ({
    address: entry.emailAddress?.address || null,
    name: entry.emailAddress?.name || null,
    type: entry.type || "required",
    status: entry.status?.response || null,
  }));
}

function normalizeCalendarEvent(event) {
  if (!event || typeof event !== "object" || !event.id) {
    throw new TypeError("Outlook event must contain an id.");
  }
  return {
    id: String(event.id),
    title: event.subject || "",
    start: event.start?.dateTime || null,
    end: event.end?.dateTime || null,
    timeZone: event.start?.timeZone || event.end?.timeZone || null,
    isAllDay: Boolean(event.isAllDay),
    location: event.location?.displayName || null,
    organizer: event.organizer?.emailAddress?.address || null,
    attendees: normalizeAttendees(event.attendees),
    status: event.isCancelled ? "cancelled" : "confirmed",
    recurrence: event.recurrence || null,
    webLink: event.webLink || null,
    source: "outlook-calendar",
    raw: event,
  };
}

class OutlookCalendarConnector {
  constructor({ graphClient, pageSize = 100 }) {
    if (!graphClient || typeof graphClient.get !== "function") {
      throw new TypeError("Graph client must implement get(path, options).");
    }
    this.graphClient = graphClient;
    this.pageSize = pageSize;
  }

  async listCalendarView({ start, end, cursor = null }) {
    if (!cursor && (!start || !end)) throw new TypeError("start and end are required.");
    const path = cursor || "/me/calendarView";
    const query = cursor ? undefined : {
      startDateTime: start,
      endDateTime: end,
      "$top": this.pageSize,
      "$orderby": "start/dateTime",
    };
    const response = await this.graphClient.get(path, { query });
    return {
      items: (response.value || []).map(normalizeCalendarEvent),
      nextCursor: response["@odata.nextLink"] || null,
      deltaCursor: response["@odata.deltaLink"] || null,
    };
  }
}

module.exports = { OutlookCalendarConnector, normalizeCalendarEvent, normalizeAttendees };
