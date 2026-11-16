import "server-only";

/**
 * Minimal Supabase client: calls the `public.wedding_*` Postgres functions through the Data API
 * (`POST /rest/v1/rpc/<fn>`). Server-only — the key never reaches the browser.
 * Schema: supabase/migrations/*_wedding_invitation.sql.
 */

export class DbError extends Error {
  constructor(
    message: string,
    readonly code?: string,
  ) {
    super(message);
  }
}

export async function rpc<T>(fn: string, args: Record<string, unknown> = {}): Promise<T> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new DbError("SUPABASE_URL / SUPABASE_ANON_KEY is not set");

  const res = await fetch(`${url}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(args),
    cache: "no-store",
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => null)) as { message?: string; code?: string } | null;
    throw new DbError(err?.message ?? `${fn} failed (${res.status})`, err?.code);
  }
  return (await res.json()) as T;
}
