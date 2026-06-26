import { cookies } from "next/headers";
import { adminSessionCookieName, verifyAdminSession } from "@/src/lib/adminAuth";
import { ensureDatabase, hasDatabase, query } from "@/src/lib/database";
import type { ClientAccount } from "@/src/lib/clientProfileStorage";

export const runtime = "nodejs";

export async function GET() {
  const cookieStore = await cookies();
  const authenticated = await verifyAdminSession(
    cookieStore.get(adminSessionCookieName)?.value,
  );

  if (!authenticated) {
    return Response.json({ error: "Non autorisé." }, { status: 401 });
  }

  if (!hasDatabase()) {
    return Response.json({ accounts: [] });
  }

  await ensureDatabase();
  const rows = await query<ClientAccount>`
    SELECT email, '' AS password, profile
    FROM client_accounts
    ORDER BY updated_at DESC
  `;

  return Response.json({ accounts: rows });
}
