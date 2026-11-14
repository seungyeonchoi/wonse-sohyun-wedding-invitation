import Image from "next/image";

import { invitation } from "@/config/invitation";
import { box, u } from "@/lib/artboard";
import { brideName, groomName } from "@/lib/invitation";
import { describeWeddingDate } from "@/lib/wedding-date";

import { HeroPlayerControls } from "./hero-player";

/**
 * "The First Track" cover: a phone lock screen with the ceremony time as the clock,
 * the cover photo as a full-bleed card, and a now-playing widget. Laid out on the template's 400×711 artboard.
 */
export function Hero() {
  const date = describeWeddingDate(invitation.date);
  const { theme, hero } = invitation;

  return (
    <section
      aria-label="표지"
      className="artboard overflow-hidden"
      style={{ aspectRatio: "400 / 711", background: theme.heroBackground }}
    >

      <p
        className="font-inter flex items-center justify-center whitespace-nowrap"
        style={{ ...box(0, 28, 400, 40), gap: u(8), fontSize: u(20), color: theme.heroText }}
      >
        <span>{date.monthDayKo}</span>
        <span>{date.weekdayKo}</span>
      </p>

      <p
        className="font-inter flex items-center justify-center font-semibold tracking-normal"
        style={{ ...box(0, 61, 400, 94), fontSize: u(90), lineHeight: 1.5, color: theme.heroText }}
      >
        <time dateTime={invitation.date}>{date.clock}</time>
      </p>

      <div
        className="overflow-hidden"
        style={{
          ...box(38, 172, 324, 324),
          borderRadius: u(17),
          boxShadow: `${u(4)} ${u(4)} ${u(50)} rgb(0 0 0 / 0.2)`,
        }}
      >
        <Image src={hero.photo} alt={`${groomName}와 ${brideName}`} fill priority sizes="(max-width: 430px) 81vw, 348px" className="object-cover" />
      </div>

      <div
        style={{
          ...box(21, 526, 358, 140),
          background: "rgb(255 255 255 / 0.75)",
          borderRadius: u(19),
          boxShadow: `0 ${u(4)} ${u(40)} rgb(0 0 0 / 0.2)`,
        }}
      />
      <p
        className="font-inter flex items-center justify-center font-semibold whitespace-nowrap text-[#0f0f0f]"
        style={{ ...box(61.5, 537.5, 277, 24), fontSize: u(18) }}
      >
        {hero.playerTitle}
      </p>
      <p
        className="font-gothic flex items-center justify-center whitespace-nowrap text-[#76706a]"
        style={{ ...box(80, 556, 240, 40), gap: u(5), fontSize: u(15) }}
      >
        <span>{groomName}</span>
        <span>그리고</span>
        <span>{brideName}</span>
      </p>
      <HeroPlayerControls />
    </section>
  );
}
