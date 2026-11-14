import { deleteEntry } from "@/lib/guestbook-store";

export async function DELETE(request: Request, ctx: RouteContext<"/api/guestbook/[id]">) {
  const { id } = await ctx.params;
  const body = (await request.json().catch(() => null)) as { password?: unknown } | null;
  const password = typeof body?.password === "string" ? body.password : "";

  const result = await deleteEntry(id, password);
  if (result === "not_found") return Response.json({ error: "이미 삭제된 글이에요." }, { status: 404 });
  if (result === "forbidden") return Response.json({ error: "비밀번호가 일치하지 않아요." }, { status: 403 });
  return new Response(null, { status: 204 });
}
