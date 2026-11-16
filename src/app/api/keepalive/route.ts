import { connection } from "next/server";

import { safely } from "@/lib/api";
import { getCheers } from "@/lib/reactions-store";

/**
 * Pinged once a day by a Vercel cron (vercel.json). Supabase pauses free projects after a week
 * without requests, and the time capsule has to stay reachable until the first anniversary.
 */
export async function GET() {
  await connection();
  return safely(async () => {
    await getCheers();
    return Response.json({ ok: true });
  });
}
