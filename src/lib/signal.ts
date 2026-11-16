"use client";

import { useSyncExternalStore } from "react";

/** A tiny shared value that client components in different parts of the tree can read and set. */
export type Signal<T> = {
  get: () => T;
  set: (next: T) => void;
  subscribe: (listener: () => void) => () => void;
};

export function signal<T>(initial: T): Signal<T> {
  let value = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => value,
    set(next) {
      if (Object.is(next, value)) return;
      value = next;
      listeners.forEach((l) => l());
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export function useSignal<T>(s: Signal<T>) {
  return useSyncExternalStore(s.subscribe, s.get, s.get);
}

/** Page-wide particle effect: snow (waveform easter egg) or hearts (Konami code). */
export const pageEffect = signal<"snow" | "hearts" | null>(null);

/** The wedding day in the calendar was tapped: show the "add to calendar" buttons. */
export const calendarUnlocked = signal(false);
