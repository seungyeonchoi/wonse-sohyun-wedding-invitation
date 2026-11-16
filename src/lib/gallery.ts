/** "/photos/gallery/07.jpg" → "07": a stable id for likes. */
export const photoId = (src: string) => src.split("/").pop()!.replace(/\.[^.]+$/, "");
