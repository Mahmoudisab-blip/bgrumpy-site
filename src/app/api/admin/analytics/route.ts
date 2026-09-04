import { cookies } from "next/headers";
import { adminSessionCookieName, verifyAdminSession } from "@/src/lib/adminAuth";
import { readServerAnalytics } from "@/src/lib/serverAnalyticsStore";

export const runtime = "nodejs";

export async function GET() {
  const cookieStore = await cookies();
  const authenticated = await verifyAdminSession(
    cookieStore.get(adminSessionCookieName)?.value,
  );

  if (!authenticated) {
    return Response.json({ error: "Non autorisé." }, { status: 401 });
  }

  try {
    return Response.json(await readServerAnalytics(), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return Response.json(
      { error: "Les statistiques sont momentanément indisponibles." },
      { status: 503 },
    );
  }
}
