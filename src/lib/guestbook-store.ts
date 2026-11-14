import "server-only";

import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";

/**
 * Guestbook storage.
 *
 * ⚠️ This keeps entries in server memory: they survive hot reloads but not restarts,
 * and serverless instances don't share them. Replace the three functions below with
 * a real database (Supabase, Vercel Postgres, Upstash Redis …) before going live —
 * the API routes and UI only depend on these signatures.
 */

export type GuestbookEntry = {
  id: string;
  name: string;
  message: string;
  createdAt: string;
};

type StoredEntry = GuestbookEntry & { salt: string; hash: string };

const store = globalThis as unknown as { __guestbook?: StoredEntry[] };
const entries = (store.__guestbook ??= []);

function hashPassword(password: string, salt: string) {
  return scryptSync(password, salt, 32).toString("hex");
}

export async function listEntries(): Promise<GuestbookEntry[]> {
  return entries
    .map(({ id, name, message, createdAt }) => ({ id, name, message, createdAt }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function addEntry(input: { name: string; message: string; password: string }): Promise<GuestbookEntry> {
  const salt = randomBytes(16).toString("hex");
  const entry: StoredEntry = {
    id: randomUUID(),
    name: input.name,
    message: input.message,
    createdAt: new Date().toISOString(),
    salt,
    hash: hashPassword(input.password, salt),
  };
  entries.push(entry);
  const { id, name, message, createdAt } = entry;
  return { id, name, message, createdAt };
}

export async function deleteEntry(id: string, password: string): Promise<"ok" | "not_found" | "forbidden"> {
  const index = entries.findIndex((e) => e.id === id);
  if (index === -1) return "not_found";
  const entry = entries[index];
  const attempt = Buffer.from(hashPassword(password, entry.salt), "hex");
  if (!timingSafeEqual(attempt, Buffer.from(entry.hash, "hex"))) return "forbidden";
  entries.splice(index, 1);
  return "ok";
}
