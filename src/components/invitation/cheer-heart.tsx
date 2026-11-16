"use client";

import { Heart } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

import { BurstLayer, useBurst } from "./burst";

/** Taps are sent in batches this long after the last one. */
const FLUSH_DELAY = 800;
/** Taps in this visit that reveal the secret message. */
const SECRET_AT = 10;

/**
 * The footer heart. Every tap sends a little burst of hearts and adds to a counter shared by
 * every guest ("N번의 축하가 전해졌어요"). Tap it ten times for a hidden message.
 */
export function CheerHeart({ secret }: { secret: string }) {
  const [total, setTotal] = useState<number | null>(null);
  const [mine, setMine] = useState(0);
  const unsent = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const flushRef = useRef<() => void>(() => {});
  const { bursts, trigger } = useBurst({ count: 7, distance: 34 });

  useEffect(() => {
    fetch("/api/cheers")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: { count: number }) => setTotal(data.count))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const flush = () => {
      clearTimeout(timer.current);
      const count = unsent.current;
      if (!count) return;
      unsent.current = 0;
      fetch("/api/cheers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count }),
        keepalive: true,
      })
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((data: { count: number }) => setTotal(data.count))
        .catch(() => {});
    };
    flushRef.current = flush;
    const onHide = () => document.visibilityState === "hidden" && flush();
    document.addEventListener("visibilitychange", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      flush();
    };
  }, []);

  const tap = () => {
    trigger();
    navigator.vibrate?.(10);
    unsent.current += 1;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => flushRef.current(), FLUSH_DELAY);
    setTotal((t) => (t ?? 0) + 1);
    const next = mine + 1;
    setMine(next);
    if (next === SECRET_AT) toast(secret, { duration: 6000 });
  };

  return (
    <div className="flex flex-col items-center gap-1.5">
      <button type="button" onClick={tap} aria-label="축하 하트 보내기" className="relative transition-transform active:scale-90">
        <Heart className={cn("size-9 transition-colors", mine > 0 && "fill-ink-accent/80 text-ink-accent")} strokeWidth={1.4} aria-hidden />
        <BurstLayer bursts={bursts} />
      </button>
      <p className="min-h-[14px] text-[11px] leading-[14px] tracking-[0.1px]" aria-live="polite">
        {total ? `${total.toLocaleString("ko-KR")}번의 축하가 전해졌어요` : null}
      </p>
    </div>
  );
}
