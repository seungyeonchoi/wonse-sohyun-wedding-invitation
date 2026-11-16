"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";

type Piece = { dx: number; dy: number; rotate: number; scale: number; delay: number };
type Burst = { id: number; x: string; y: string; pieces: Piece[] };

const LIFETIME = 1100;

/**
 * Little hearts that fly out of a point and fade. `trigger()` adds a burst; `x`/`y` are CSS
 * lengths inside the <BurstLayer>'s positioned parent (default: its centre).
 */
export function useBurst({ count = 9, distance = 46 }: { count?: number; distance?: number } = {}) {
  const [bursts, setBursts] = useState<Burst[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const trigger = useCallback(
    (x = "50%", y = "50%") => {
      const id = nextId.current++;
      const pieces = Array.from({ length: count }, (_, i): Piece => {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.6;
        const r = distance * (0.6 + Math.random() * 0.6);
        return {
          dx: Math.cos(angle) * r,
          // drift upward a little, like a balloon
          dy: Math.sin(angle) * r - distance * 0.35,
          rotate: Math.random() * 60 - 30,
          scale: 0.7 + Math.random() * 0.7,
          delay: Math.random() * 80,
        };
      });
      setBursts((prev) => [...prev, { id, x, y, pieces }]);
      const timer = setTimeout(() => {
        timers.current.delete(timer);
        setBursts((prev) => prev.filter((b) => b.id !== id));
      }, LIFETIME);
      timers.current.add(timer);
    },
    [count, distance],
  );

  return { bursts, trigger };
}

export function BurstLayer({ bursts, className = "text-ink-accent" }: { bursts: Burst[]; className?: string }) {
  return (
    <span aria-hidden className={`pointer-events-none absolute inset-0 overflow-visible ${className}`}>
      {bursts.map((b) =>
        b.pieces.map((p, i) => (
          <span
            key={`${b.id}-${i}`}
            className="burst-heart absolute text-[14px] leading-none"
            style={
              {
                left: b.x,
                top: b.y,
                "--dx": `${p.dx}px`,
                "--dy": `${p.dy}px`,
                "--r": `${p.rotate}deg`,
                "--s": p.scale,
                animationDelay: `${p.delay}ms`,
              } as CSSProperties
            }
          >
            ♥
          </span>
        )),
      )}
    </span>
  );
}
