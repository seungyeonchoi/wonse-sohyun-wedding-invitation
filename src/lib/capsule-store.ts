import "server-only";

import { DbError, rpc } from "./supabase";

/**
 * Time-capsule letters (wedding.capsule_letters) in Supabase. The database itself refuses to hand
 * them out before the opening date (wedding.capsule_settings.opens_at) or without the couple's key.
 */

export type CapsuleLetter = { id: string; name: string; message: string; createdAt: string };

export async function countLetters(): Promise<number> {
  return rpc<number>("wedding_capsule_count");
}

export async function addLetter(input: { name: string; message: string }): Promise<number> {
  return rpc<number>("wedding_capsule_add", { p_name: input.name, p_message: input.message });
}

export async function openLetters(key: string): Promise<CapsuleLetter[] | "not_yet" | "wrong_key"> {
  try {
    const rows = await rpc<{ id: string; name: string; message: string; created_at: string }[]>("wedding_capsule_open", { p_key: key });
    return rows.map(({ id, name, message, created_at }) => ({ id, name, message, createdAt: created_at }));
  } catch (err) {
    if (err instanceof DbError && err.message === "capsule_not_open_yet") return "not_yet";
    if (err instanceof DbError && err.message === "capsule_wrong_key") return "wrong_key";
    throw err;
  }
}
