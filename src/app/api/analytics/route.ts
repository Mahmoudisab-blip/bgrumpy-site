import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { recordServerSiteVisit } from "@/src/lib/serverAnalyticsStore";

export const runtime = "nodejs";

const visitorCookieName = "bgrumpy-visitor-id";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { path?: string } | null;
  const requestedPath = typeof body?.path === "string" ? body.path : "/";

  if (requestedPath.startsWith("/admin")) {
    return Response.json({ ok: true });
  }

  const cookieStore = await cookies();
  const existingVisitorId = cookieStore.get(visitorCookieName)?.value;
  const visitorId = existingVisitorId || randomUUID();

  await recordServerSiteVisit(visitorId, requestedPath);

  const response = Response.json({ ok: true });

  if (!existingVisitorId) {
    response.headers.append(
      "Set-Cookie",
      `${visitorCookieName}=${visitorId}; Max-Age=31536000; Path=/; HttpOnly; SameSite=Lax${
        process.env.NODE_ENV === "production" ? "; Secure" : ""
      }`,
    );
  }

  return response;
}
