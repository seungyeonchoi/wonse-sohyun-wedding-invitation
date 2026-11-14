"use client";

import { useEffect } from "react";

/**
 * iOS Safari ignores `user-scalable=no`, so cancel its pinch-zoom gesture here.
 * Only the browser's page zoom is cancelled; the events still reach the page
 * (e.g. the Kakao map keeps its own pinch zoom).
 */
export function ZoomLock() {
  useEffect(() => {
    const block = (e: Event) => e.preventDefault();
    const events = ["gesturestart", "gesturechange"] as const;
    events.forEach((type) => document.addEventListener(type, block, { passive: false }));
    return () => events.forEach((type) => document.removeEventListener(type, block));
  }, []);
  return null;
}
