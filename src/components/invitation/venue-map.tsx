"use client";

import { useEffect, useRef, useState } from "react";

import { KAKAO_JS_KEY, loadKakaoMaps } from "@/lib/kakao";
import { cn } from "@/lib/utils";

/**
 * Map locked behind a frosted overlay until the guest double-taps it, so scrolling
 * the invitation never gets hijacked by the map. Uses Kakao Maps when a key is set,
 * otherwise an OpenStreetMap embed.
 */
export function VenueMap({ lat, lng, name }: { lat: number; lng: number; name: string }) {
  const el = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const map = useRef<any>(null);
  const lastTap = useRef(0);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    if (!KAKAO_JS_KEY) return;
    let cancelled = false;
    loadKakaoMaps()
      .then((maps) => {
        if (!maps || cancelled || !el.current) return;
        const center = new maps.LatLng(lat, lng);
        map.current = new maps.Map(el.current, { center, level: 3, draggable: false, scrollwheel: false });
        new maps.Marker({ position: center, title: name }).setMap(map.current);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [lat, lng, name]);

  useEffect(() => {
    map.current?.setDraggable(unlocked);
    map.current?.setZoomable(unlocked);
  }, [unlocked]);

  const d = 0.0035;
  const osm = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - d},${lat - d * 0.7},${lng + d},${lat + d * 0.7}&layer=mapnik&marker=${lat},${lng}`;

  return (
    <div className="relative aspect-[356/294] w-full overflow-hidden">
      {KAKAO_JS_KEY ? (
        // `isolate` keeps Kakao's internal z-indexed layers (tiles, marker) below the lock overlay
        <div ref={el} className="isolate size-full bg-[#f2efe9]" />
      ) : (
        <iframe title={`${name} 지도`} src={osm} className={cn("size-full border-0", !unlocked && "pointer-events-none")} loading="lazy" />
      )}

      {!unlocked ? (
        <button
          type="button"
          className="absolute inset-0 z-10 grid place-items-center bg-white/50 p-3 font-gothic text-[14px] tracking-[-0.04em] text-[#616161] backdrop-blur-[3px] transition-all duration-200"
          onPointerUp={() => {
            const now = Date.now();
            if (now - lastTap.current < 350) setUnlocked(true);
            lastTap.current = now;
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setUnlocked(true);
          }}
          aria-label="지도 조작하기"
        >
          지도를 두 번 탭하면 이동할 수 있어요
        </button>
      ) : null}
    </div>
  );
}
