"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";

import { box, u } from "@/lib/artboard";
import { cn } from "@/lib/utils";

/** How long (s) the childhood photo stays once the card is on screen, before it fades to now. */
const HOLD = 1.5;
/** How long a tap shows the childhood photo again before it fades back to now. */
const REPLAY_HOLD_MS = 1800;

type Props = {
  x: number;
  y: number;
  src: string;
  name: string;
  /** Extra delay (s) before this card changes, so the two cards change one after the other. */
  changeDelay: number;
  /** Childhood photo shown first; it fades away to reveal the wedding photo. */
  childSrc?: string;
};

/**
 * A polaroid on the mini-album artboard. It shows the childhood photo first; once the card is well on
 * screen it fades away to the wedding photo underneath. Tapping the card shows the childhood photo again.
 */
export function Polaroid({ x, y, src, name, changeDelay, childSrc }: Props) {
  const figure = useRef<HTMLElement>(null);
  const [then, setThen] = useState(Boolean(childSrc));
  const replay = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const el = figure.current;
    if (!el || !childSrc) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
        timer = setTimeout(() => setThen(false), reduced ? 0 : (changeDelay + HOLD) * 1000);
      },
      // start once the card is well on screen, so the guest actually sees it change
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearTimeout(timer);
      clearTimeout(replay.current);
    };
  }, [childSrc, changeDelay]);

  const playAgain = () => {
    if (!childSrc || then || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setThen(true);
    clearTimeout(replay.current);
    replay.current = setTimeout(() => setThen(false), REPLAY_HOLD_MS);
  };

  return (
    <figure
      ref={figure}
      className={cn("m-0 bg-[#e0e0e0]", childSrc && "cursor-pointer select-none [-webkit-touch-callout:none]")}
      style={{ ...box(x, y, 148, 222), boxShadow: "0 1px 0 rgb(0 0 0 / 0.16)" }}
      {...(childSrc
        ? {
            role: "button",
            tabIndex: 0,
            "aria-label": `${name} 어린 시절 사진 다시 보기`,
            onClick: playAgain,
            onKeyDown: (e: KeyboardEvent) => {
              if (e.key !== "Enter" && e.key !== " ") return;
              e.preventDefault();
              playAgain();
            },
          }
        : {})}
    >
      <div className="absolute overflow-hidden" style={box(10, 12.5, 128, 161)}>
        <Image src={src} alt={name} fill sizes="140px" draggable={false} className="object-cover" />
        {childSrc ? (
          <Image
            src={childSrc}
            alt={`어린 시절 ${name}`}
            aria-hidden={!then}
            fill
            sizes="140px"
            draggable={false}
            className={cn(
              "object-cover transition-opacity duration-[1200ms] ease-in-out motion-reduce:hidden",
              then ? "opacity-100" : "opacity-0",
            )}
          />
        ) : null}
        <div className="absolute inset-0 shadow-[inset_0_1px_1px_rgb(0_0_0/0.3)]" />
      </div>
      <figcaption
        className="font-signature flex items-center justify-center whitespace-nowrap tracking-normal"
        style={{ ...box(0, 181.75, 148, 35), fontSize: u(22) }}
      >
        {name}
      </figcaption>
    </figure>
  );
}
