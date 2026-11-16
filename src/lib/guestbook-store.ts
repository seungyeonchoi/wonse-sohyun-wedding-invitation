import "server-only";

import { rpc } from "./supabase";

/** Guestbook, stored in Supabase (wedding.guestbook). Passwords are bcrypt-hashed and checked in the database. */

export type GuestbookEntry = {
  id: string;
  name: string;
  message: string;
  createdAt: string;
};

type Row = { id: string; name: string; message: string; created_at: string };

const toEntry = ({ id, name, message, created_at }: Row): GuestbookEntry => ({ id, name, message, createdAt: created_at });

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function listEntries(): Promise<GuestbookEntry[]> {
  return (await rpc<Row[]>("wedding_guestbook_list")).map(toEntry);
}

export async function addEntry(input: { name: string; message: string; password: string }): Promise<GuestbookEntry> {
  const [row] = await rpc<Row[]>("wedding_guestbook_add", { p_name: input.name, p_message: input.message, p_password: input.password });
  return toEntry(row);
}

export async function deleteEntry(id: string, password: string): Promise<"ok" | "not_found" | "forbidden"> {
  if (!UUID.test(id)) return "not_found";
  return rpc<"ok" | "not_found" | "forbidden">("wedding_guestbook_delete", { p_id: id, p_password: password });
}
