import { connection } from "next/server";

import { invitation } from "@/config/invitation";
import { asciiHeart } from "@/lib/ascii-heart";
import { brideName, groomName } from "@/lib/invitation";
import { describeWeddingDate, formatDuration, weddingPhase } from "@/lib/wedding-date";

/** ANSI colours; skipped with ?plain for piping into files. */
const paint = (on: boolean) => (code: string, s: string) => (on ? `\x1b[${code}m${s}\x1b[0m` : s);

function dday(now: Date) {
  const phase = weddingPhase(invitation.date, invitation.ceremonyMinutes, now);
  switch (phase.kind) {
    case "upcoming":
      return { badge: `D-${phase.days}`, text: `결혼식까지 ${phase.days}일 남았습니다.`, progress: 1 - Math.min(phase.days, 365) / 365 };
    case "today":
      return { badge: "D-DAY", text: `오늘! 예식까지 ${formatDuration(phase.minutesLeft)} 남았습니다.`, progress: 0.99 };
    case "ceremony":
      return { badge: "ON AIR", text: "지금 예식이 진행 중입니다.", progress: 1 };
    case "married":
      return { badge: `D+${phase.day - 1}`, text: `부부가 된 지 ${phase.day}일째입니다.`, progress: 1 };
  }
}

/**
 * The invitation as plain text for terminals: `curl <site>` is rewritten here (see next.config.ts),
 * like wttr.in. Also reachable directly at /invitation.txt.
 */
export async function GET(request: Request) {
  await connection();
  const c = paint(!new URL(request.url).searchParams.has("plain"));
  const date = describeWeddingDate(invitation.date);
  const { venue, hall, address, lat, lng, naverMapUrl } = invitation.location;
  const d = dday(new Date());
  const BAR = 30;
  const knob = Math.round(d.progress * (BAR - 1));
  const bar = `${"━".repeat(knob)}●${"─".repeat(BAR - 1 - knob)}`;
  const subway = invitation.location.transport.find((t) => t.kind === "subway");
  const indent = (s: string, n = 4) =>
    s
      .split("\n")
      .map((l) => " ".repeat(n) + l)
      .join("\n");

  const text = [
    "",
    c("31", indent(asciiHeart())),
    "",
    indent(c("1", `${groomName} ♥ ${brideName}, 결혼합니다`)),
    "",
    indent(`▶ ${invitation.hero.playerTitle}`),
    indent(`  ${bar}  ${c("1;31", d.badge)}`),
    indent(`  ${d.text}`),
    "",
    indent(invitation.greeting.paragraphs.join("\n")),
    "",
    indent(`일시   ${date.fullKo}`),
    indent(`장소   ${venue} ${hall}`),
    indent(`       ${address}`),
    subway ? indent(`교통   ${subway.description.split("\n")[0].replace(/^\S*\s/, "")}`) : null,
    "",
    indent(`지도   ${naverMapUrl ?? `https://map.naver.com/p/search/${encodeURIComponent(address)}`}`),
    indent(`       https://map.kakao.com/link/to/${encodeURIComponent(venue)},${lat},${lng}`),
    indent(`청첩장 ${invitation.meta.siteUrl}`),
    "",
    indent(c("2", `$ git commit -m "feat: ${groomName} ♥ ${brideName}, 평생 함께하기로 함"`)),
    "",
    "",
  ]
    .filter((l) => l !== null)
    .join("\n");

  return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
}
