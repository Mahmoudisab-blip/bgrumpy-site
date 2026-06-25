import { cookies } from "next/headers";
import { adminSessionCookieName, verifyAdminSession } from "@/src/lib/adminAuth";
import { listServerDevis } from "@/src/lib/serverDevisStore";

export const runtime = "nodejs";

export async function GET() {
  const cookieStore = await cookies();
  const authenticated = await verifyAdminSession(
    cookieStore.get(adminSessionCookieName)?.value,
  );

  if (!authenticated) {
    return Response.json({ error: "Non autorisé." }, { status: 401 });
  }

  const devis = await listServerDevis();

  return Response.json({ devis });
}
