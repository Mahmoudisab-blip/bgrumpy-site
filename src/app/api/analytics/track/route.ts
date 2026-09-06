import { cookies } from "next/headers";
import { analyticsConsentVersion } from "@/src/lib/analyticsConsent";
import { recordServerVisit } from "@/src/lib/serverAnalytics";

export const runtime = "nodejs";

const visitorCookieName = "bgrumpy-visitor-id";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as {
    consent?: unknown;
    consentVersion?: unknown;
    consentRecordedAt?: unknown;
    path?: unknown;
  } | null;
  const path = typeof body?.path === "string" ? body.path.trim().slice(0, 200) : "";
  const consentVersion = typeof body?.consentVersion === "string" ? body.consentVersion : "";
  const consentRecordedAt = typeof body?.consentRecordedAt === "string" && Number.isFinite(Date.parse(body.consentRecordedAt))
    ? new Date(body.consentRecordedAt).toISOString()
    : "";

  if (body?.consent !== true || consentVersion !== analyticsConsentVersion || !consentRecordedAt) {
    return Response.json({ ok: false, requiresConsent: true }, { status: 403 });
  }

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
    consented: true,
    consentVersion,
    consentRecordedAt,
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

export async function DELETE() {
  const response = Response.json({ ok: true });
  response.headers.append(
    "Set-Cookie",
    `${visitorCookieName}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
  );
  return response;
}
