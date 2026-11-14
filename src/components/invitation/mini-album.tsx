import Image from "next/image";

import { invitation } from "@/config/invitation";
import { box, u } from "@/lib/artboard";

import { Reveal } from "./reveal";

function Polaroid({ x, y, src, name }: { x: number; y: number; src: string; name: string }) {
  return (
    <figure
      className="m-0 bg-[#e0e0e0]"
      style={{ ...box(x, y, 148, 222), boxShadow: "0 1px 0 rgb(0 0 0 / 0.16)" }}
    >
      <div className="absolute overflow-hidden" style={box(10, 12.5, 128, 161)}>
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

/** Two polaroids signed with the couple's English names (template "2구 폴라로이드"). */
export function MiniAlbum() {
  const { miniAlbum, groom, bride } = invitation;
  return (
    <Reveal aria-label="미니 앨범">
      <div className="artboard" style={{ aspectRatio: "400 / 500" }}>
        <Polaroid x={41.75} y={139.25} src={miniAlbum.groomPhoto} name={groom.englishName} />
        <Polaroid x={210.25} y={138.75} src={miniAlbum.bridePhoto} name={bride.englishName} />
      </div>
    </Reveal>
  );
}
