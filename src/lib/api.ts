import "server-only";

/**
 * Runs a route handler's database work so an outage answers with a friendly JSON error instead of
 * an HTML 500. Call `connection()` before this, not inside it: its prerender signal must not be caught.
 */
export async function safely(work: () => Promise<Response>): Promise<Response> {
  try {
    return await work();
  } catch (err) {
    console.error(err);
    return Response.json({ error: "잠시 후 다시 시도해 주세요." }, { status: 503 });
  }
}
