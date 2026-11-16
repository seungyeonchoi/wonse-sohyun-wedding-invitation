"use client";

import { CalendarPlus } from "lucide-react";
import type { CSSProperties } from "react";

import { googleCalendarUrl } from "@/lib/calendar-event";
import { calendarUnlocked, useSignal } from "@/lib/signal";

import { BurstLayer, useBurst } from "./burst";

/** The circled wedding day. Tapping it sends up hearts and reveals the "add to calendar" buttons. */
export function WeddingDayMark({ day, className, style }: { day: number; className: string; style: CSSProperties }) {
  const { bursts, trigger } = useBurst({ count: 10, distance: 40 });
  return (
    <button
      type="button"
      className={className}
      style={style}
      aria-current="date"
      aria-label={`${day}일, 예식일. 내 캘린더에 추가하기`}
      onClick={() => {
        trigger();
        calendarUnlocked.set(true);
      }}
    >
      {day}
      <BurstLayer bursts={bursts} />
    </button>
  );
}

const chip =
  "inline-flex h-9 items-center gap-1.5 rounded-full border border-line-strong bg-paper-deep px-4 text-[13px] text-ink transition-opacity hover:opacity-70";

export function AddToCalendar() {
  const unlocked = useSignal(calendarUnlocked);
  if (!unlocked) return null;
  return (
    <div className="mt-5 flex justify-center gap-2 duration-500 animate-in fade-in slide-in-from-top-2">
      <a href="/wedding.ics" className={chip}>
        <CalendarPlus className="size-4" strokeWidth={1.6} aria-hidden />내 캘린더에 저장
      </a>
      <a href={googleCalendarUrl()} target="_blank" rel="noreferrer" className={chip}>
        구글 캘린더
      </a>
    </div>
  );
}
