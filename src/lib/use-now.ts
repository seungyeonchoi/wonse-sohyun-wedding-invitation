"use client";

import { useSyncExternalStore } from "react";

import { invitation } from "@/config/invitation";

import { weddingPhase } from "./wedding-date";

/**
 * The current time, rounded down to the minute and shared by every component that asks.
 * `null` during server rendering and hydration, so time-dependent copy never mismatches.
 */
const listeners = new Set<() => void>();
let minute = 0;
let timer: ReturnType<typeof setInterval> | undefined;

function tick() {
  const m = Math.floor(Date.now() / 60_000);
  if (m === minute) return;
  minute = m;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!timer) {
    timer = setInterval(tick, 5_000);
    document.addEventListener("visibilitychange", tick);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size || !timer) return;
    clearInterval(timer);
    timer = undefined;
    document.removeEventListener("visibilitychange", tick);
  };
}

function getSnapshot() {
  if (!minute) minute = Math.floor(Date.now() / 60_000);
  return minute;
}

export function useNow(): Date | null {
  const m = useSyncExternalStore(subscribe, getSnapshot, () => null);
  return m === null ? null : new Date(m * 60_000);
}

export function useWeddingPhase() {
  const now = useNow();
  return now ? weddingPhase(invitation.date, invitation.ceremonyMinutes, now) : null;
}
