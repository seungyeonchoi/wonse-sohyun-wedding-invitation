"use client";

import { MessageCircleHeart } from "lucide-react";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

import { invitation } from "@/config/invitation";
import { box, u } from "@/lib/artboard";
import { fetchGuestbook } from "@/lib/guestbook-client";
import type { GuestbookEntry } from "@/lib/guestbook-store";
import { brideName, groomName } from "@/lib/invitation";
import { useNow, useWeddingPhase } from "@/lib/use-now";
import { describeWeddingDate, formatDuration, type WeddingPhase } from "@/lib/wedding-date";

/** Wait after load before the first banner, and how long each banner stays (incl. slide in/out). */
const FIRST_DELAY = 1400;
const HOLD = 4200;
/** Latest guestbook messages shown as banners. */
const MAX_MESSAGES = 3;

type Note = { id: string; app: string; icon: ReactNode; when: string; title: string; body: string; target: string };

const date = describeWeddingDate(invitation.date);
const couple = `${groomName} ♥ ${brideName}`;

function CalendarIcon() {
  return (
    <span className="flex size-full flex-col items-center justify-center rounded-[22%] bg-white leading-none text-[#111]">
      <span className="font-semibold text-[#e5463b]" style={{ fontSize: u(8) }}>
        {date.weekdayKo.slice(0, 1)}
      </span>
      <span style={{ fontSize: u(17), marginTop: u(1) }}>{date.day}</span>
    </span>
  );
}

function GuestbookIcon() {
  return (
    <span className="grid size-full place-items-center rounded-[22%] bg-ink-accent text-white">
      <MessageCircleHeart style={{ width: u(20), height: u(20) }} strokeWidth={2} />
    </span>
  );
}

function calendarNote(phase: WeddingPhase): Note {
  const base = { id: "calendar", app: "캘린더", icon: <CalendarIcon />, target: "calendar", title: `${couple} 결혼식` };
  switch (phase.kind) {
    case "upcoming":
      return { ...base, when: `D-${phase.days}`, body: `${date.monthDayKo} ${date.weekdayTimeKo} · ${invitation.location.venue}` };
    case "today":
      return { ...base, when: "오늘", body: `예식까지 ${formatDuration(phase.minutesLeft)} 남았어요 · ${invitation.location.venue}` };
    case "ceremony":
      return { ...base, when: "지금", body: "지금 예식이 진행 중이에요 💐" };
    case "married":
      return { ...base, title: couple, when: `D+${phase.day - 1}`, body: `부부가 된 지 ${phase.day}일째 되는 날이에요` };
  }
}

function ago(iso: string, now: Date) {
  const minutes = Math.floor((now.getTime() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return "지금";
  if (minutes < 60) return `${minutes}분 전`;
  if (minutes < 60 * 24) return `${Math.floor(minutes / 60)}시간 전`;
  if (minutes < 60 * 24 * 7) return `${Math.floor(minutes / 60 / 24)}일 전`;
  const d = new Date(iso);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

/**
 * iOS-style banners that drop onto the lock-screen cover once after the page opens:
 * a calendar reminder for the wedding, then the newest guestbook messages.
 * Tapping a banner scrolls to the matching section.
 */
export function HeroNotifications() {
  const phase = useWeddingPhase();
  const now = useNow();
  const [entries, setEntries] = useState<GuestbookEntry[] | null>(null);
  /** -1: not started, notes.length: finished */
  const [index, setIndex] = useState(-1);

  useEffect(() => {
    fetchGuestbook()
      .then(setEntries)
      .catch(() => setEntries([]));
  }, []);

  const notes =
    phase && now && entries
      ? [
          calendarNote(phase),
          ...entries.slice(0, MAX_MESSAGES).map(
            (e): Note => ({
              id: e.id,
              app: "방명록",
              icon: <GuestbookIcon />,
              when: ago(e.createdAt, now),
              title: e.name,
              body: e.message,
              target: "guestbook",
            }),
          ),
        ]
      : null;

  const ready = notes !== null;
  const count = notes?.length ?? 0;

  useEffect(() => {
    if (!ready || index >= count) return;
    const t = setTimeout(() => setIndex((i) => i + 1), index === -1 ? FIRST_DELAY : HOLD);
    return () => clearTimeout(t);
  }, [ready, index, count]);

  const note = notes && index >= 0 ? notes[index] : undefined;
  if (!note) return null;

  return (
    <div className="z-20" style={{ ...box(12, 12, 376, 0), height: "auto" }}>
      <button
        key={note.id}
        type="button"
        onClick={() => {
          setIndex(count);
          document.getElementById(note.target)?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
        className="hero-notification flex w-full items-center bg-white/80 text-left font-gothic tracking-normal text-[#111] shadow-[0_8px_30px_rgb(0_0_0/0.25)] backdrop-blur-xl"
        style={{ "--hold": `${HOLD}ms`, gap: u(10), padding: `${u(10)} ${u(14)} ${u(11)} ${u(10)}`, borderRadius: u(20) } as CSSProperties}
      >
        <span className="shrink-0" style={{ width: u(38), height: u(38) }}>
          {note.icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline justify-between text-[#6b6b6b]" style={{ fontSize: u(11.5), gap: u(8) }}>
            <span>{note.app}</span>
            <span className="shrink-0">{note.when}</span>
          </span>
          <span className="block truncate font-semibold" style={{ fontSize: u(14), lineHeight: 1.35 }}>
            {note.title}
          </span>
          <span className="line-clamp-2 block" style={{ fontSize: u(13), lineHeight: 1.35 }}>
            {note.body}
          </span>
        </span>
      </button>
    </div>
  );
}
