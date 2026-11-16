import { connection } from "next/server";

import { invitation } from "@/config/invitation";
import { safely } from "@/lib/api";
import { photoId } from "@/lib/gallery";
import { addLike, getLikes } from "@/lib/reactions-store";

const PHOTO_IDS = new Set(invitation.gallery.photos.map((p) => photoId(p.src)));

export async function GET() {
  await connection();
  return safely(async () => Response.json({ likes: await getLikes() }));
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { photo?: unknown; delta?: unknown } | null;
  const photo = typeof body?.photo === "string" ? body.photo : "";
  const delta = body?.delta === -1 ? -1 : body?.delta === 1 ? 1 : 0;
  if (!PHOTO_IDS.has(photo) || !delta) return Response.json({ error: "잘못된 요청이에요." }, { status: 400 });
  return safely(async () => Response.json({ photo, count: await addLike(photo, delta) }));
}
