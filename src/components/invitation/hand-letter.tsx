import Image from "next/image";

import { invitation } from "@/config/invitation";
import { u } from "@/lib/artboard";
import { brideName, groomName } from "@/lib/invitation";

import { Reveal } from "./reveal";

const PHOTO_HEIGHTS = [110, 110, 109.6];

/** Photo-booth film strip followed by a handwritten letter (template "엽서카드형"). */
export function HandLetter() {
  const { handLetter } = invitation;
  const paragraphs = handLetter.text.split(/\n\s*\n/);

  return (
    <Reveal aria-label="손편지" className="pt-9">
      <div
        className="artboard flex flex-col items-center"
        style={{ paddingTop: u(62.6), paddingBottom: u(52), gap: u(32) }}
      >
        <div className="relative bg-black" style={{ width: u(114.33), height: u(364.33) }}>
          <div className="absolute flex flex-col" style={{ left: u(7), top: u(14), gap: u(3) }}>
            {handLetter.photos.slice(0, 3).map((src, i) => (
              <div key={src} className="relative overflow-hidden" style={{ width: u(100), height: u(PHOTO_HEIGHTS[i]) }}>
                <Image src={src} alt="" fill sizes="100px" className="object-cover" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center" style={{ gap: u(32) }}>
          {handLetter.image ? (
            <div className="relative" style={{ width: u(347), height: u(307) }}>
              <Image src={handLetter.image} alt={handLetter.text} fill sizes="350px" className="object-contain" />
            </div>
          ) : (
            <div
              className="font-pen tracking-[0.04em] text-[#1d1d1d]"
              style={{ width: u(347), minHeight: u(307), paddingLeft: u(30), paddingRight: u(6), fontSize: u(22), lineHeight: u(34), wordSpacing: "0.3em" }}
            >
              {paragraphs.map((para, i) => (
                <p key={i} className="whitespace-pre-line" style={{ marginTop: i ? u(14) : 0 }}>
                  {para.trim()}
                </p>
              ))}
            </div>
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
