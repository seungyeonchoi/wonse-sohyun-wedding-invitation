"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { GalleryPhoto } from "@/config/invitation";

import { Reveal } from "./reveal";
import { SectionLabel } from "./section-heading";
import { TemplateButton } from "./template-button";

/** Row spans of the template's masonry grid (46px rows on a 177px column), repeating. */
const SPANS = [6, 3, 5, 3];

export function Gallery({ title, photos, initialCount }: { title: string; photos: GalleryPhoto[]; initialCount: number }) {
  const [expanded, setExpanded] = useState(false);
  const [openAt, setOpenAt] = useState<number | null>(null);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

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
                setOpenAt(i);
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

      <Dialog open={openAt !== null} onOpenChange={(open) => !open && setOpenAt(null)}>
        <DialogContent
          showCloseButton={false}
          className="h-dvh max-h-none w-screen max-w-none rounded-none bg-black p-0 ring-0 sm:max-w-none"
          aria-describedby={undefined}
        >
          <DialogTitle className="sr-only">웨딩 사진</DialogTitle>
          {openAt !== null ? (
            <Carousel
              opts={{ startIndex: openAt, loop: true }}
              setApi={(a) => {
                setApi(a);
                a?.on("select", () => setCurrent(a.selectedScrollSnap()));
              }}
              className="flex h-dvh items-center"
            >
              <CarouselContent className="h-dvh">
                {photos.map(({ src }) => (
                  <CarouselItem key={src} className="relative h-dvh">
                    <Image src={src} alt="" fill sizes="100vw" className="object-contain" />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-3 border-white/30 bg-black/40 text-white hover:bg-black/60 hover:text-white" />
              <CarouselNext className="right-3 border-white/30 bg-black/40 text-white hover:bg-black/60 hover:text-white" />
            </Carousel>
          ) : null}
          <p className="pointer-events-none absolute top-5 left-1/2 -translate-x-1/2 font-inter text-sm tracking-normal text-white/80">
            {(api ? current : (openAt ?? 0)) + 1} / {photos.length}
          </p>
          <DialogClose className="absolute top-3 right-3 grid size-10 place-items-center text-white" aria-label="닫기">
            <X className="size-6" />
          </DialogClose>
        </DialogContent>
      </Dialog>
    </Reveal>
  );
}
