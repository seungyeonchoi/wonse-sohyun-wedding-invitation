"use client";

import { useEffect, useRef, type PointerEvent } from "react";
import { toast } from "sonner";

import { invitation } from "@/config/invitation";
import { box, u } from "@/lib/artboard";
import { loadKakaoSdk } from "@/lib/kakao";
import { shareInvitation } from "@/lib/share";
import { pageEffect, useSignal } from "@/lib/signal";
import { useWeddingPhase } from "@/lib/use-now";
import { cn } from "@/lib/utils";

import { useBgm } from "./bgm";
import { Particles } from "./particles";

const INK = "#434343";
const SOFT = "#817c77";

/** Fill shown when no BGM is configured, matching the template's static artwork. */
const IDLE_PROGRESS = 0.359;

/** Resting heights of the template's 6-bar waveform glyph. */
const BARS = [0.45, 0.62, 1, 0.62, 0.5, 0.45];
/** Each bar gets its own pattern and tempo so they bounce out of sync, like the iPhone's now-playing glyph. */
const BAR_MOTION: [className: string, seconds: number][] = [
  ["motion-safe:animate-eq-a", 1.05],
  ["motion-safe:animate-eq-b", 0.82],
  ["motion-safe:animate-eq-c", 1.21],
  ["motion-safe:animate-eq-b", 0.97],
  ["motion-safe:animate-eq-a", 0.88],
  ["motion-safe:animate-eq-c", 1.12],
];

function DoubleTriangle({ flip }: { flip?: boolean }) {
  return (
    <svg viewBox="0 0 34 22" className="size-full" style={flip ? { transform: "scaleX(-1)" } : undefined}>
      <path d="M17 3.2v15.6c0 1.6-1.8 2.6-3.1 1.7L2.3 12.7a2 2 0 0 1 0-3.4L13.9 1.5C15.2.6 17 1.6 17 3.2Z" fill={INK} />
      <path d="M33.2 3.2v15.6c0 1.6-1.8 2.6-3.1 1.7l-11.6-7.8a2 2 0 0 1 0-3.4l11.6-7.8c1.3-.9 3.1.1 3.1 1.7Z" fill={INK} />
    </svg>
  );
}

/** Taps on the waveform (each within TAP_WINDOW of the last) that start or stop the page-wide snow. */
const SNOW_TAPS = 5;
const TAP_WINDOW = 700;

/** Player title: "Now playing, Our story!" until the wedding, then the next track. */
export function HeroPlayerTitle() {
  const phase = useWeddingPhase();
  return <>{phase?.kind === "married" ? invitation.hero.playerTitleAfter : invitation.hero.playerTitle}</>;
}

function formatTime(sec: number) {
  if (!Number.isFinite(sec)) return "0:00";
  const s = Math.floor(sec);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/**
 * Lock-screen style "Now playing" controls. Positions are the template's
 * artboard coordinates; every control drives the configured BGM.
 */
export function HeroPlayerControls() {
  const { available, playing, loading, currentTime, duration, toggle, seekBy, seekTo } = useBgm();
  const bar = useRef<HTMLDivElement>(null);
  const effect = useSignal(pageEffect);
  const taps = useRef({ count: 0, last: 0 });

  // The share icon is on the cover, so load the Kakao SDK once the page has settled:
  // a tap can then open KakaoTalk straight away (in-app browsers may block a share that waits on the network).
  useEffect(() => {
    const t = setTimeout(() => loadKakaoSdk().catch(() => {}), 1500);
    return () => clearTimeout(t);
  }, []);

  const onWaveTap = () => {
    const now = Date.now();
    const t = taps.current;
    t.count = now - t.last < TAP_WINDOW ? t.count + 1 : 1;
    t.last = now;
    if (t.count < SNOW_TAPS) return;
    t.count = 0;
    const snowing = effect === "snow";
    pageEffect.set(snowing ? null : "snow");
    toast(snowing ? "눈이 그쳤어요." : "❄️ Snowy — 눈이 내려요.");
  };

  const ratio = available ? (duration ? currentTime / duration : 0) : IDLE_PROGRESS;
  // Once music has started the bars keep their animation and simply freeze while paused.
  const started = playing || currentTime > 0;

  const seekFromPointer = (e: PointerEvent<HTMLDivElement>) => {
    const rect = bar.current?.getBoundingClientRect();
    if (!rect) return;
    seekTo((e.clientX - rect.left) / rect.width);
  };

  return (
    <>
      {/* "Snowy": snow falls on the cover while the song plays (the page-wide snow takes over when it is on) */}
      <Particles active={playing && effect !== "snow"} className="pointer-events-none absolute inset-0 size-full" />

      {/* waveform glyph — bounces while music is playing; tap it five times for snow everywhere */}
      <div
        aria-hidden
        className="flex items-center justify-between before:absolute before:-inset-2"
        style={{ ...box(333, 549, 24, 25), padding: `0 ${u(1)}` }}
        onClick={onWaveTap}
      >
        {BARS.map((h, i) => {
          const [animation, seconds] = BAR_MOTION[i];
          return (
            <span
              key={i}
              className={cn("block origin-center rounded-full", started && animation)}
              style={{
                width: u(2.4),
                height: "100%",
                background: SOFT,
                // resting shape; the animation takes over while it runs and holds its frame when paused
                transform: `scaleY(${h})`,
                animationDuration: `${seconds}s`,
                animationDelay: `${i * -0.23}s`,
                animationPlayState: playing ? "running" : "paused",
              }}
            />
          );
        })}
      </div>

      <div
        ref={bar}
        role="slider"
        tabIndex={available ? 0 : -1}
        aria-label="재생 위치"
        aria-disabled={!available}
        aria-valuemin={0}
        aria-valuemax={Math.round(duration) || 0}
        aria-valuenow={Math.round(currentTime)}
        aria-valuetext={`${formatTime(currentTime)} / ${formatTime(duration)}`}
        data-bgm-control
        className={cn("touch-none", available && "cursor-pointer before:absolute before:-inset-y-3 before:inset-x-0")}
        style={{ ...box(39, 596, 318, 8), borderRadius: u(4), background: SOFT }}
        onPointerDown={(e) => {
          if (!available) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          seekFromPointer(e);
        }}
        onPointerMove={(e) => {
          if (available && e.currentTarget.hasPointerCapture(e.pointerId)) seekFromPointer(e);
        }}
        onKeyDown={(e) => {
          if (!available) return;
          if (e.key === "ArrowLeft") seekBy(-5);
          else if (e.key === "ArrowRight") seekBy(5);
          else if (e.key === "Home") seekTo(0);
          else if (e.key === "End") seekTo(0.999);
          else return;
          e.preventDefault();
        }}
      >
        <div className="pointer-events-none h-full" style={{ width: `${ratio * 100}%`, background: INK, borderRadius: u(4) }} />
      </div>

      <button
        type="button"
        data-bgm-control
        aria-label="10초 뒤로"
        disabled={!available}
        onClick={() => seekBy(-10)}
        style={box(112, 625, 34, 22)}
        className="transition-transform active:scale-90 disabled:cursor-default"
      >
        <DoubleTriangle />
      </button>

      <button
        type="button"
        data-bgm-control
        aria-label={playing ? "일시정지" : "재생"}
        aria-pressed={playing}
        disabled={!available}
        onClick={toggle}
        style={box(186, 620, 28, 31)}
        className={cn("transition-transform active:scale-90 disabled:cursor-default", loading && "animate-pulse")}
      >
        {available && !playing ? (
          <svg viewBox="0 0 28 31" className="size-full">
            <path d="M4 3.4v24.2c0 1.6 1.7 2.5 3 1.7l19-12.1a2 2 0 0 0 0-3.4L7 1.7C5.7.9 4 1.8 4 3.4Z" fill={INK} />
          </svg>
        ) : (
          <svg viewBox="0 0 28 31" className="size-full">
            <rect x="3" y="0" width="9" height="31" rx="2" fill={INK} />
            <rect x="16.5" y="0" width="9" height="31" rx="2" fill={INK} />
          </svg>
        )}
      </button>

      <button
        type="button"
        data-bgm-control
        aria-label="10초 앞으로"
        disabled={!available}
        onClick={() => seekBy(10)}
        style={box(252, 625, 34, 22)}
        className="transition-transform active:scale-90 disabled:cursor-default"
      >
        <DoubleTriangle flip />
      </button>

      {/* AirPlay (audio) glyph: concentric arcs over a triangle. Tapping it shares the invitation on KakaoTalk. */}
      <button
        type="button"
        data-bgm-control
        aria-label="카카오톡으로 공유하기"
        onClick={shareInvitation}
        style={{ ...box(334, 626, 24, 24), color: SOFT }}
        className="transition-transform active:scale-90"
      >
        <svg aria-hidden viewBox="0 0 24 24" fill="none" className="size-full">
          <path d="M5.2 17.4a9.2 9.2 0 1 1 13.6 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M8.3 14.6a5 5 0 1 1 7.4 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M11.2 14.3a1 1 0 0 1 1.6 0l4 5.4a1 1 0 0 1-.8 1.6H8a1 1 0 0 1-.8-1.6Z" fill="currentColor" />
        </svg>
      </button>
    </>
  );
}
