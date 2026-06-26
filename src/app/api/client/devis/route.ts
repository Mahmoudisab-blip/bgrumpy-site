import { cookies } from "next/headers";
import { clientSessionCookieName, verifyClientSession } from "@/src/lib/clientAuth";
import { listServerDevis } from "@/src/lib/serverDevisStore";

export const runtime = "nodejs";

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export async function GET() {
  const cookieStore = await cookies();
  const session = verifyClientSession(cookieStore.get(clientSessionCookieName)?.value);
  const email = normalizeEmail(session?.email ?? "");

  if (!email) {
    return Response.json({ devis: [] }, { status: 401 });
  }

  const devis = (await listServerDevis()).filter(
    (item) => normalizeEmail(item.payload.email ?? "") === email,
  );

  return Response.json({ devis });
}
