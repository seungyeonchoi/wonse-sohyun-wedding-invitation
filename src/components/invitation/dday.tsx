"use client";

import { useSyncExternalStore } from "react";

import { daysUntil } from "@/lib/wedding-date";

const subscribe = () => () => {};

/** "신랑 ♥ 신부의 결혼식이 N일 남았습니다." — computed in the browser so the count is always today's. */
export function DDay({ date, groom, bride }: { date: string; groom: string; bride: string }) {
  const days = useSyncExternalStore(
    subscribe,
    () => daysUntil(date),
    () => null,
  );

  const couple = (
    <>
      {groom} <span className="text-ink-accent">♥</span> {bride}의 결혼식
    </>
  );

  return (
    <p className="min-h-[21px] text-center text-[15px] leading-[21px] tracking-[0.4px]" aria-live="polite">
      {days === null ? null : days > 0 ? (
        <>
          {couple}이 <strong className="font-bold text-ink-accent">{days}일</strong> 남았습니다.
        </>
      ) : days === 0 ? (
        <>오늘은 {couple} 날입니다.</>
      ) : (
        <>
          {couple}이 <strong className="font-bold text-ink-accent">{-days}일</strong> 지났습니다.
        </>
      )}
    </p>
  );
}
