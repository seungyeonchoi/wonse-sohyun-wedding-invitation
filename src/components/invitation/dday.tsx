"use client";

import { josa } from "@/lib/korean";
import { useWeddingPhase } from "@/lib/use-now";
import { formatDuration } from "@/lib/wedding-date";

/**
 * The D-day line under the calendar. Computed in the browser and refreshed every minute, so it
 * counts down hours on the wedding day, says the ceremony is on while it is, and afterwards
 * becomes "married for N days".
 */
export function DDay({ groom, bride }: { groom: string; bride: string }) {
  const phase = useWeddingPhase();

  const couple = (
    <>
      {groom} <span className="text-ink-accent">♥</span> {bride}
    </>
  );
  const accent = (text: string) => <strong className="font-bold text-ink-accent">{text}</strong>;

  let line = null;
  switch (phase?.kind) {
    case "upcoming":
      line = (
        <>
          {couple}의 결혼식이 {accent(`${phase.days}일`)} 남았습니다.
        </>
      );
      break;
    case "today":
      line = (
        <>
          오늘은 {couple}의 결혼식 날!
          <br />
          예식까지 {accent(formatDuration(phase.minutesLeft))} 남았습니다.
        </>
      );
      break;
    case "ceremony":
      line = (
        <>
          지금 {couple}의 결혼식이 {accent("진행 중")}입니다.
        </>
      );
      break;
    case "married":
      line =
        phase.day === 1 ? (
          <>
            오늘 {couple}
            {josa(bride, "이", "가")} {accent("부부")}가 되었습니다.
          </>
        ) : (
          <>
            {couple}
            {josa(bride, "이", "가")} 부부가 된 지 {accent(`${phase.day}일째`)}입니다.
            {phase.day % 100 === 0 ? " 🎉" : null}
          </>
        );
      break;
  }

  return <p className="min-h-[21px] text-center text-[15px] leading-[21px] tracking-[0.4px]">{line}</p>;
}
