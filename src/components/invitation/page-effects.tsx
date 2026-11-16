"use client";

import { useEffect } from "react";
import { toast } from "sonner";

import { invitation } from "@/config/invitation";
import { asciiHeart } from "@/lib/ascii-heart";
import { brideName, groomName } from "@/lib/invitation";
import { pageEffect, useSignal } from "@/lib/signal";
import { describeWeddingDate } from "@/lib/wedding-date";

import { Particles } from "./particles";

const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
/** How long the Konami heart shower lasts. */
const HEARTS_MS = 8000;

let greeted = false;

/** A note for guests who open the developer tools — the groom built this invitation himself. */
function greetDevelopers() {
  if (greeted) return;
  greeted = true;
  const art = asciiHeart()
    .split("\n")
    .map((row) => `  ${row}`)
    .join("\n");
  console.log(`%c${art}`, "color:#963d2c;font-family:monospace;font-size:11px");
  console.log(
    `%c${groomName} ♥ ${brideName}%c\n\n` +
      "개발자 하객님, 반가워요 👋\n" +
      "이 청첩장은 신랑이 직접 만들었어요.\n\n" +
      `  · 평생 유지보수 계약 체결: ${describeWeddingDate(invitation.date).fullKo}\n` +
      "  · SLA: 99.99%, 다운타임 없음\n" +
      "  · 이슈 트래커: 서로에게 직접\n\n" +
      `🖥  터미널에서도 볼 수 있어요:  curl ${invitation.meta.siteUrl}\n` +
      "🎮  ↑ ↑ ↓ ↓ ← → ← → B A",
    "color:#963d2c;font-size:20px;font-weight:bold",
    "color:inherit;font-size:12px;line-height:1.6",
  );
}

/**
 * Page-wide extras: the falling snow/hearts overlay, the Konami code (desktop guests) and the
 * developer-console greeting.
 */
export function PageEffects() {
  const effect = useSignal(pageEffect);

  useEffect(() => {
    greetDevelopers();
    const recent: string[] = [];
    let stopHearts: ReturnType<typeof setTimeout> | undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && e.target.closest("input, textarea, [contenteditable]")) return;
      recent.push(e.key.length === 1 ? e.key.toLowerCase() : e.key);
      if (recent.length > KONAMI.length) recent.shift();
      if (recent.join() !== KONAMI.join()) return;
      recent.length = 0;
      pageEffect.set("hearts");
      toast("🎮 개발자 하객 인증 완료! 하트가 쏟아집니다.");
      clearTimeout(stopHearts);
      stopHearts = setTimeout(() => pageEffect.get() === "hearts" && pageEffect.set(null), HEARTS_MS);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(stopHearts);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-y-0 left-1/2 z-40 w-full max-w-[430px] -translate-x-1/2">
      <Particles active={effect !== null} kind={effect ?? "snow"} tone="light" className="size-full" />
    </div>
  );
}
