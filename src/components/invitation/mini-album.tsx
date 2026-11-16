import { invitation } from "@/config/invitation";

import { Polaroid } from "./polaroid";
import { Reveal } from "./reveal";

/**
 * Two polaroids signed with the couple's English names (template "2구 폴라로이드").
 * They develop like instant film when they scroll into view — first as childhood photos, which then
 * fade away to the wedding photos.
 */
export function MiniAlbum() {
  const { miniAlbum, groom, bride } = invitation;
  return (
    <Reveal aria-label="미니 앨범">
      <div className="artboard" style={{ aspectRatio: "400 / 500" }}>
        <Polaroid x={41.75} y={139.25} src={miniAlbum.groomPhoto} name={groom.englishName} developDelay={0.2} childSrc={miniAlbum.groomChildPhoto} />
        <Polaroid x={210.25} y={138.75} src={miniAlbum.bridePhoto} name={bride.englishName} developDelay={0.7} childSrc={miniAlbum.brideChildPhoto} />
      </div>
    </Reveal>
  );
}
