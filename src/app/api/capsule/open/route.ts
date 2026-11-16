import { safely } from "@/lib/api";
import { openLetters } from "@/lib/capsule-store";

/**
 * Opens the time capsule. The database checks both conditions: the opening date
 * (wedding.capsule_settings.opens_at) and the couple's key (bcrypt hash in key_hash).
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { key?: unknown } | null;
  const key = typeof body?.key === "string" ? body.key : "";
  return safely(async () => {
    const result = await openLetters(key);
    if (result === "not_yet") return Response.json({ error: "아직 열 수 없어요. 첫 결혼기념일에 열려요." }, { status: 403 });
    if (result === "wrong_key") return Response.json({ error: "열쇠가 맞지 않아요." }, { status: 403 });
    return Response.json({ letters: result });
  });
}
