"use client";

import type { GuestbookEntry } from "./guestbook-store";

let pending: Promise<GuestbookEntry[]> | null = null;

/** Guestbook entries, fetched once and shared by the guestbook section and the lock-screen notifications. */
export function fetchGuestbook() {
  pending ??= fetch("/api/guestbook")
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
    .then((data: { entries: GuestbookEntry[] }) => data.entries)
    .catch((err: unknown) => {
      pending = null;
      throw err;
    });
  return pending;
}
