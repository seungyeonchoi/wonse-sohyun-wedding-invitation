import { connection } from "next/server";

import { safely } from "@/lib/api";
import { addLetter, countLetters } from "@/lib/capsule-store";

const LIMITS = { name: 20, message: 1000 };

/** How many letters are waiting. The letters themselves only come out of /api/capsule/open. */
export async function GET() {
  await connection();
  return safely(async () => Response.json({ count: await countLetters() }));
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  if (!name || name.length > LIMITS.name) {
    return Response.json({ error: `이름은 1~${LIMITS.name}자로 입력해 주세요.` }, { status: 400 });
  }
  if (!message || message.length > LIMITS.message) {
    return Response.json({ error: `내용은 1~${LIMITS.message}자로 입력해 주세요.` }, { status: 400 });
  }
  return safely(async () => Response.json({ count: await addLetter({ name, message }) }, { status: 201 }));
}
