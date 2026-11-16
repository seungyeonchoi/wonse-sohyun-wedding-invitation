import "server-only";

import { rpc } from "./supabase";

/** Gallery likes (wedding.photo_likes) and the footer's "cheers" counter (wedding.counters), in Supabase. */

export async function getLikes(): Promise<Record<string, number>> {
  const rows = await rpc<{ photo: string; count: number }[]>("wedding_likes");
  return Object.fromEntries(rows.map((r) => [r.photo, r.count]));
}

/** delta is +1 (like) or -1 (unlike); never goes below zero. */
export async function addLike(photo: string, delta: 1 | -1): Promise<number> {
  return rpc<number>("wedding_like", { p_photo: photo, p_delta: delta });
}

export async function getCheers(): Promise<number> {
  return Number(await rpc<number | string>("wedding_cheers"));
}

export async function addCheers(count: number): Promise<number> {
  return Number(await rpc<number | string>("wedding_add_cheers", { p_count: count }));
}
