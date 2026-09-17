import { cookies } from "next/headers";
import { adminSessionCookieName, verifyAdminSession } from "@/src/lib/adminAuth";
import { deleteServerDevis, listServerDevis } from "@/src/lib/serverDevisStore";

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


export async function DELETE(request: Request) {
  const cookieStore = await cookies();
  const authenticated = await verifyAdminSession(
    cookieStore.get(adminSessionCookieName)?.value,
  );

  if (!authenticated) {
    return Response.json({ error: "Non autorisé." }, { status: 401 });
  }

  const body = await request.json().catch(() => null) as { id?: unknown } | null;
  const id = typeof body?.id === "string" ? body.id.trim() : "";

  if (!id || id.length > 180) {
    return Response.json({ error: "Demande invalide." }, { status: 400 });
  }

  const deleted = await deleteServerDevis(id);

  if (!deleted) {
    return Response.json({ error: "Demande introuvable." }, { status: 404 });
  }

  return Response.json({ ok: true });
}
