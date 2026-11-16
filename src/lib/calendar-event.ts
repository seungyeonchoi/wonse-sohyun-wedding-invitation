import { invitation } from "@/config/invitation";

import { brideName, groomName } from "./invitation";

/** The ceremony as a calendar event, shared by the .ics file and the Google Calendar link. */
export function weddingEvent() {
  const start = new Date(invitation.date);
  const end = new Date(start.getTime() + invitation.ceremonyMinutes * 60_000);
  const { venue, hall, address } = invitation.location;
  return {
    title: `${groomName} ♥ ${brideName} 결혼식`,
    start,
    end,
    location: `${venue} ${hall}, ${address}`,
    details: `${invitation.meta.title}\n모바일 청첩장: ${invitation.meta.siteUrl}`,
  };
}

/** 2027-02-27T06:00:00.000Z → 20270227T060000Z */
export const icsTime = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

export function googleCalendarUrl() {
  const e = weddingEvent();
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: e.title,
    dates: `${icsTime(e.start)}/${icsTime(e.end)}`,
    location: e.location,
    details: e.details,
    ctz: "Asia/Seoul",
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}
