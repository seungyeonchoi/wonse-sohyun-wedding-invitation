import Image from "next/image";

import { box, u } from "@/lib/artboard";

type Props = {
  x: number;
  y: number;
  src: string;
  name: string;
  /** Delay before the instant-film "develop" effect starts, so the two cards develop one after the other. */
  developDelay: number;
};

/** A polaroid on the mini-album artboard. The photo develops like instant film when it scrolls into view. */
export function Polaroid({ x, y, src, name, developDelay }: Props) {
  return (
    <figure className="m-0 bg-[#e0e0e0]" style={{ ...box(x, y, 148, 222), boxShadow: "0 1px 0 rgb(0 0 0 / 0.16)" }}>
      <div className="polaroid-film absolute overflow-hidden" style={{ ...box(10, 12.5, 128, 161), animationDelay: `${developDelay}s` }}>
        <Image src={src} alt={name} fill sizes="140px" className="object-cover" />
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
