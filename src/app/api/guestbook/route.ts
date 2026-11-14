import { connection } from "next/server";

import { addEntry, listEntries } from "@/lib/guestbook-store";

export async function GET() {
  await connection();
  return Response.json({ entries: await listEntries() });
}

const LIMITS = { name: 20, message: 500, passwordMin: 4, passwordMax: 20 };

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!name || name.length > LIMITS.name) {
    return Response.json({ error: `이름은 1~${LIMITS.name}자로 입력해 주세요.` }, { status: 400 });
  }
  if (!message || message.length > LIMITS.message) {
    return Response.json({ error: `내용은 1~${LIMITS.message}자로 입력해 주세요.` }, { status: 400 });
  }
  if (password.length < LIMITS.passwordMin || password.length > LIMITS.passwordMax) {
    return Response.json({ error: `비밀번호는 ${LIMITS.passwordMin}~${LIMITS.passwordMax}자로 입력해 주세요.` }, { status: 400 });
  }

  const entry = await addEntry({ name, message, password });
  return Response.json({ entry }, { status: 201 });
}
