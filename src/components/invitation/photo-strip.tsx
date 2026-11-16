"use client";

import Image from "next/image";
import { useState } from "react";

import { u } from "@/lib/artboard";

const PHOTO_HEIGHTS = [110, 110, 109.6];
/** Seconds between the booth's shots. */
const SHOT_GAP = 0.5;

/** Photo-booth film strip. Tap it and the booth "shoots" again: each frame goes dark, flashes, and reappears. */
export function PhotoStrip({ photos }: { photos: string[] }) {
  const [take, setTake] = useState(0);
  return (
    <button
      type="button"
      aria-label="네컷 사진 다시 찍기"
      onClick={() => setTake((t) => t + 1)}
      className="relative bg-black"
      style={{ width: u(114.33), height: u(364.33) }}
    >
      <span className="absolute flex flex-col" style={{ left: u(7), top: u(14), gap: u(3) }}>
        {photos.slice(0, 3).map((src, i) => (
          <span key={src} className="relative block overflow-hidden" style={{ width: u(100), height: u(PHOTO_HEIGHTS[i]) }}>
            <Image src={src} alt="" fill sizes="100px" className="object-cover" />
            {take ? <span key={take} className="booth-shot absolute inset-0" style={{ animationDelay: `${0.25 + i * SHOT_GAP}s` }} /> : null}
          </span>
        ))}
      </span>
    </button>
  );
}
