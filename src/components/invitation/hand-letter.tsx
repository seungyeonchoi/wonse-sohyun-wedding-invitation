import Image from "next/image";
import type { CSSProperties } from "react";

import { invitation } from "@/config/invitation";
import { u } from "@/lib/artboard";
import { brideName, groomName } from "@/lib/invitation";

import { InView } from "./in-view";
import { PhotoStrip } from "./photo-strip";
import { Reveal } from "./reveal";

/** Handwriting pace: seconds per character, pause between lines and between paragraphs. */
const PER_CHAR = 0.035;
const LINE_PAUSE = 0.06;
const PARAGRAPH_PAUSE = 0.2;
/** Shortest time for one line, and the wait before the first one. */
const MIN_LINE = 0.25;
const START = 0.2;

/** Splits the letter into paragraphs of lines, each with when it starts being "written" and for how long. */
function timeline(text: string) {
  let at = START;
  return text.split(/\n\s*\n/).map((para, p) => {
    if (p) at += PARAGRAPH_PAUSE;
    return para
      .trim()
      .split("\n")
      .map((line) => {
        const duration = Math.max(MIN_LINE, line.length * PER_CHAR);
        const item = { line, delay: at, duration };
        at += duration + LINE_PAUSE;
        return item;
      });
  });
}

/** Photo-booth film strip followed by a handwritten letter (template "엽서카드형"). */
export function HandLetter() {
  const { handLetter } = invitation;
  const paragraphs = timeline(handLetter.text);

  return (
    <Reveal aria-label="손편지" className="pt-9">
      <div
        className="artboard flex flex-col items-center"
        style={{ paddingTop: u(62.6), paddingBottom: u(52), gap: u(32) }}
      >
        <PhotoStrip photos={handLetter.photos} />

        <div className="flex flex-col items-center" style={{ gap: u(32) }}>
          {handLetter.image ? (
            <div className="relative" style={{ width: u(347), height: u(307) }}>
              <Image src={handLetter.image} alt={handLetter.text} fill sizes="350px" className="object-contain" />
            </div>
          ) : (
            <InView
              className="font-pen tracking-[0.04em] text-[#1d1d1d]"
              style={{ width: u(347), minHeight: u(307), paddingLeft: u(30), paddingRight: u(6), fontSize: u(22), lineHeight: u(34), wordSpacing: "0.3em" }}
            >
              {paragraphs.map((lines, i) => (
                <p key={i} style={{ marginTop: i ? u(14) : 0 }}>
                  {lines.map(({ line, delay, duration }, j) => (
                    <span
                      key={j}
                      className="letter-line block w-fit"
                      style={{ "--d": `${delay.toFixed(2)}s`, "--t": `${duration.toFixed(2)}s` } as CSSProperties}
                    >
                      {line}
                    </span>
                  ))}
                </p>
              ))}
            </InView>
          )}

          <p className="flex items-center text-[#5c5c5c]" style={{ gap: u(5), fontSize: u(13), lineHeight: 1.5 }}>
            <span>신랑</span>
            <span>{groomName}</span>
            <span>&amp;</span>
            <span>신부</span>
            <span>{brideName}</span>
            <span>올림</span>
          </p>
        </div>
      </div>
    </Reveal>
  );
}
