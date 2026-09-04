import { cookies } from "next/headers";
import { recordServerVisit } from "@/src/lib/serverAnalytics";

export const runtime = "nodejs";

const visitorCookieName = "bgrumpy-visitor-id";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { path?: unknown } | null;
  const path = typeof body?.path === "string" ? body.path.trim().slice(0, 200) : "";

  if (!path.startsWith("/") || path.startsWith("/admin") || path.startsWith("/_next")) {
    return Response.json({ ok: false }, { status: 400 });
  }

  const cookieStore = await cookies();
  const existingVisitorId = cookieStore.get(visitorCookieName)?.value;
  const visitorId = existingVisitorId || crypto.randomUUID();

  await recordServerVisit({
    path,
    referrer: request.headers.get("referer"),
    userAgent: request.headers.get("user-agent"),
    visitorId,
  });

  const response = Response.json({ ok: true });

  if (!existingVisitorId) {
    response.headers.append(
      "Set-Cookie",
      `${visitorCookieName}=${visitorId}; Max-Age=31536000; Path=/; HttpOnly; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
    );
  }

  return response;
}
