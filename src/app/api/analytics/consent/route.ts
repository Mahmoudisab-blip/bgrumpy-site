import { analyticsConsentVersion } from "@/src/lib/analyticsConsent";
import { recordServerAnalyticsConsent } from "@/src/lib/serverAnalytics";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as {
    decision?: unknown;
    version?: unknown;
    recordedAt?: unknown;
  } | null;
  const decision = body?.decision === "accepted" || body?.decision === "refused" ? body.decision : null;
  const version = typeof body?.version === "string" ? body.version : "";
  const recordedAt = typeof body?.recordedAt === "string" && Number.isFinite(Date.parse(body.recordedAt))
    ? new Date(body.recordedAt).toISOString()
    : "";

  if (!decision || version !== analyticsConsentVersion || !recordedAt) {
    return Response.json({ ok: false }, { status: 400 });
  }

  try {
    const saved = await recordServerAnalyticsConsent({ decision, version, recordedAt });
    return Response.json({ ok: saved }, { status: saved ? 200 : 503 });
  } catch {
    return Response.json({ ok: false }, { status: 503 });
  }
}
