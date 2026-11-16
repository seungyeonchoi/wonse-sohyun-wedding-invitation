import { connection } from "next/server";

import { safely } from "@/lib/api";
import { addCheers, getCheers } from "@/lib/reactions-store";

/** Taps are batched on the client; cap a single batch so one request can't inflate the count (the DB caps it too). */
const MAX_BATCH = 30;

export async function GET() {
  await connection();
  return safely(async () => Response.json({ count: await getCheers() }));
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { count?: unknown } | null;
  const count = typeof body?.count === "number" && Number.isInteger(body.count) ? Math.min(body.count, MAX_BATCH) : 0;
  if (count < 1) return Response.json({ error: "잘못된 요청이에요." }, { status: 400 });
  return safely(async () => Response.json({ count: await addCheers(count) }));
}
