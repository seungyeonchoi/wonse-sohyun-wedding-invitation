"use client";

import { useEffect, useState } from "react";

import { u } from "@/lib/artboard";
import { useNow } from "@/lib/use-now";
import { describeWeddingDate } from "@/lib/wedding-date";

/** How long the real time stays up after a tap before the ceremony time comes back. */
const SHOW_NOW_MS = 4000;

/**
 * The lock-screen date and clock. They show the ceremony time; tapping them flips to the
 * guest's actual "now" for a few seconds, like waking a real phone.
 */
export function HeroClock({ iso, color }: { iso: string; color: string }) {
  const [showNow, setShowNow] = useState(false);
  const now = useNow();

  useEffect(() => {
    if (!showNow) return;
    const t = setTimeout(() => setShowNow(false), SHOW_NOW_MS);
    return () => clearTimeout(t);
  }, [showNow]);

  const live = showNow && now ? describeWeddingDate(now.toISOString()) : null;
  const shown = live ?? describeWeddingDate(iso);

  return (
    <button
      type="button"
      onClick={() => setShowNow((v) => !v)}
      aria-label={live ? "예식 시간 보기" : "지금 시각 보기"}
      className="absolute font-inter"
      style={{ left: 0, top: u(28), width: "100%", height: u(127), color }}
    >
      <span key={live ? "now" : "wedding"} className="absolute inset-0 duration-500 animate-in fade-in">
        <span
          className="absolute flex items-center justify-center whitespace-nowrap"
          style={{ left: 0, top: 0, width: "100%", height: u(40), gap: u(8), fontSize: u(20) }}
        >
          <span>{shown.monthDayKo}</span>
          <span>{shown.weekdayKo}</span>
        </span>
        <span
          className="absolute flex items-center justify-center font-semibold tracking-normal"
          style={{ left: 0, top: u(33), width: "100%", height: u(94), fontSize: u(90), lineHeight: 1.5 }}
        >
          <time dateTime={live ? now!.toISOString() : iso}>{shown.clock}</time>
        </span>
      </span>
    </button>
  );
}
