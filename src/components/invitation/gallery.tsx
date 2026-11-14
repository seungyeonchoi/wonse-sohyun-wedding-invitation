"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { useRef, useState, type PointerEvent } from "react";

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { GalleryPhoto } from "@/config/invitation";
import { cn } from "@/lib/utils";

import { Reveal } from "./reveal";
import { SectionLabel } from "./section-heading";
import { TemplateButton } from "./template-button";

/** Row spans of the template's masonry grid (46px rows on a 177px column), repeating. */
const SPANS = [6, 3, 5, 3];

const ARROW = "border-white/30 bg-black/40 text-white transition-opacity hover:bg-black/60 hover:text-white";

/** Swipe-down-to-close: how far (px) or how fast (px/ms) the photo must be pulled down. */
const DISMISS_DISTANCE = 120;
const DISMISS_SPEED = 0.6;
/** Movement (px) before deciding whether a drag is vertical (close) or horizontal (next photo). */
const AXIS_LOCK = 8;

type Drag = { id: number; x: number; y: number; axis: "x" | "y" | null; lastY: number; lastT: number; prevY: number; prevT: number };

export function Gallery({ title, photos, initialCount }: { title: string; photos: GalleryPhoto[]; initialCount: number }) {
  const [expanded, setExpanded] = useState(false);
  const [open, setOpen] = useState(false);
  const [startAt, setStartAt] = useState(0);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  /** How far the photo is pulled down (px) and whether a finger/mouse is still holding it. */
  const [pullY, setPullY] = useState(0);
  const [pulling, setPulling] = useState(false);
  const drag = useRef<Drag | null>(null);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || (e.target instanceof Element && e.target.closest("button"))) return;
    const t = e.timeStamp;
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, axis: null, lastY: e.clientY, lastT: t, prevY: e.clientY, prevT: t };
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.axis) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) < AXIS_LOCK) return;
      // Horizontal drags belong to the carousel (next/previous photo).
      d.axis = Math.abs(dy) > Math.abs(dx) ? "y" : "x";
      if (d.axis === "y") {
        e.currentTarget.setPointerCapture(e.pointerId);
        setPulling(true);
      }
    }
    if (d.axis !== "y") return;
    d.prevY = d.lastY;
    d.prevT = d.lastT;
    d.lastY = e.clientY;
    d.lastT = e.timeStamp;
    setPullY(Math.max(dy, 0));
  };

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (d.axis !== "y") return;
    setPulling(false);
    const pulled = Math.max(d.lastY - d.y, 0);
    // A flick counts only if the finger was still moving when it let go.
    const speed = e.timeStamp - d.lastT > 100 ? 0 : (d.lastY - d.prevY) / Math.max(d.lastT - d.prevT, 1);
    if (pulled > DISMISS_DISTANCE || (pulled > 30 && speed > DISMISS_SPEED)) setOpen(false);
    else setPullY(0); // springs back (transition below)
  };

  /** 0 → 1 as the photo is pulled down; fades the black backdrop and the controls. */
  const pullProgress = Math.min(pullY / 400, 1);

  const visible = expanded ? photos : photos.slice(0, initialCount);

  return (
    <Reveal aria-label="갤러리" className="flex flex-col items-center px-4 py-12">
      <SectionLabel>GALLERY</SectionLabel>
      <h2 className="mt-2.5 p-3 text-center text-[19px] leading-[28.5px]">{title}</h2>

      <ul
        className="mt-4 grid w-full grid-cols-2 gap-1"
        style={{ gridAutoRows: "calc((100cqw - 36px) / 2 * 46 / 177)" }}
      >
        {visible.map(({ src, position }, i) => (
          <li key={src} className="relative overflow-hidden bg-[#f5f7f7]" style={{ gridRowEnd: `span ${SPANS[i % SPANS.length]}` }}>
            <button
              type="button"
              className="absolute inset-0"
              onClick={() => {
                setCurrent(i);
                setStartAt(i);
                setPullY(0);
                setOpen(true);
              }}
              aria-label={`사진 ${i + 1} 크게 보기`}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="(max-width: 430px) 50vw, 210px"
                className="object-cover"
                style={{ objectPosition: position ?? "50% 30%" }}
              />
            </button>
          </li>
        ))}
      </ul>

      {!expanded && photos.length > initialCount ? (
        <TemplateButton className="mt-6" onClick={() => setExpanded(true)}>
          더 보기
        </TemplateButton>
      ) : null}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className={cn(
            "h-dvh max-h-none w-screen max-w-none rounded-none bg-black p-0 ring-0 sm:max-w-none",
            !pulling && "transition-[background-color] duration-200",
          )}
          style={{ backgroundColor: `rgb(0 0 0 / ${1 - pullProgress * 0.85})` }}
          aria-describedby={undefined}
        >
          <DialogTitle className="sr-only">웨딩 사진</DialogTitle>
          {/* Rendered for the whole time the dialog is mounted, so the photo stays put while it fades out. */}
          <Carousel
            opts={{ startIndex: startAt, loop: true }}
            setApi={(a) => {
              setApi(a);
              a?.on("select", () => setCurrent(a.selectedScrollSnap()));
            }}
            // Not a flex container: as a flex item the slide viewport shrank to the photo's width on
            // wide (PC) screens. Slide gutters are removed so each photo is centred edge to edge.
            // touch-none: vertical drags must reach the swipe-down handler instead of the browser.
            className={cn("h-dvh touch-none", !pulling && "transition-transform duration-200")}
            style={{ transform: pullY ? `translateY(${pullY}px) scale(${1 - pullProgress * 0.2})` : undefined }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <CarouselContent className="ml-0 h-dvh">
              {photos.map(({ src }) => (
                <CarouselItem key={src} className="relative h-dvh pl-0">
                  <Image src={src} alt="" fill sizes="100vw" draggable={false} className="object-contain select-none" />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className={cn(ARROW, "left-3", pullY > 0 && "opacity-0")} />
            <CarouselNext className={cn(ARROW, "right-3", pullY > 0 && "opacity-0")} />
          </Carousel>
          <p
            className={cn(
              "pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-black/40 px-2.5 py-0.5 font-inter text-sm tracking-normal text-white/90 transition-opacity",
              pullY > 0 && "opacity-0",
            )}
          >
            {(api ? current : startAt) + 1} / {photos.length}
          </p>
          <DialogClose
            className={cn("absolute top-3 right-3 grid size-10 place-items-center text-white transition-opacity", pullY > 0 && "opacity-0")}
            aria-label="닫기"
          >
            <X className="size-6" />
          </DialogClose>
        </DialogContent>
      </Dialog>
    </Reveal>
  );
}
