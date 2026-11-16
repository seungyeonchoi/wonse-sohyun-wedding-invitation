"use client";

import { useEffect, useRef } from "react";

type Kind = "snow" | "hearts";

type Props = {
  /** While true new particles keep falling; when it turns false the ones on screen finish their fall. */
  active: boolean;
  kind?: Kind;
  /** "dark": white flakes for dark backgrounds, "light": blue-grey flakes that show on paper. */
  tone?: "dark" | "light";
  className?: string;
};

type Particle = {
  kind: Kind;
  x: number;
  y: number;
  size: number;
  vy: number;
  phase: number;
  sway: number;
  alpha: number;
  color: string;
};

const HEART_COLORS = ["#c0392b", "#e05a6d", "#963d2c", "#f08a9b"];
/** Screen area (px²) per particle. */
const AREA_PER = { snow: 2400, hearts: 7000 };

function spawn(kind: Kind, w: number, tone: Props["tone"]): Particle {
  const snow = kind === "snow";
  const size = snow ? 1.2 + Math.random() * 2.6 : 7 + Math.random() * 7;
  return {
    kind,
    x: Math.random() * w,
    y: -size * 2,
    size,
    // bigger flakes are closer, so they fall faster
    vy: snow ? 14 + size * 9 + Math.random() * 10 : 55 + Math.random() * 60,
    phase: Math.random() * Math.PI * 2,
    sway: 0.4 + Math.random() * 0.9,
    alpha: snow ? 0.45 + Math.random() * 0.5 : 0.75 + Math.random() * 0.25,
    color: snow ? (tone === "light" ? "164 182 204" : "255 255 255") : HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)],
  };
}

function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.3);
  ctx.bezierCurveTo(x, y, x - s * 0.5, y, x - s * 0.5, y + s * 0.3);
  ctx.bezierCurveTo(x - s * 0.5, y + s * 0.6, x, y + s * 0.8, x, y + s);
  ctx.bezierCurveTo(x, y + s * 0.8, x + s * 0.5, y + s * 0.6, x + s * 0.5, y + s * 0.3);
  ctx.bezierCurveTo(x + s * 0.5, y, x, y, x, y + s * 0.3);
  ctx.fill();
}

/** Falling snow or hearts on a canvas that fills its positioned parent. Off for reduced-motion users. */
export function Particles({ active, kind = "snow", tone = "dark", className }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const settings = useRef({ active, kind, tone });
  const wake = useRef<() => void>(() => {});

  useEffect(() => {
    settings.current = { active, kind, tone };
    if (active) wake.current();
  }, [active, kind, tone]);

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let last = 0;
    const particles: Particle[] = [];

    const resize = () => {
      const r = el.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width;
      h = r.height;
      el.width = Math.round(w * dpr);
      el.height = Math.round(h * dpr);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();

    const frame = (t: number) => {
      const dt = Math.min((t - last) / 1000, 0.05);
      last = t;
      const { active, kind, tone } = settings.current;
      const target = active ? Math.round((w * h) / AREA_PER[kind]) : 0;
      // trickle in rather than appearing all at once
      if (particles.length < target && Math.random() < 0.5) particles.push(spawn(kind, w, tone));

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.y += p.vy * dt;
        p.phase += p.sway * dt;
        const x = p.x + Math.sin(p.phase) * (p.kind === "snow" ? 12 : 22);
        if (p.y - p.size * 2 > h) {
          particles.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = p.alpha;
        if (p.kind === "snow") {
          ctx.fillStyle = `rgb(${p.color})`;
          ctx.beginPath();
          ctx.arc(x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = p.color;
          drawHeart(ctx, x, p.y, p.size);
        }
      }
      ctx.globalAlpha = 1;

      raf = particles.length || settings.current.active ? requestAnimationFrame(frame) : 0;
    };

    wake.current = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    if (settings.current.active) wake.current();

    return () => {
      cancelAnimationFrame(raf);
      raf = 0;
      ro.disconnect();
      wake.current = () => {};
    };
  }, []);

  return <canvas ref={canvas} aria-hidden className={className} />;
}
