import { cookies } from "next/headers";
import { adminSessionCookieName, verifyAdminSession } from "@/src/lib/adminAuth";
import { normalizeAdminState } from "@/src/lib/adminState";
import { hasStoredAdminState, readAdminState, writeAdminState } from "@/src/lib/serverAdminStore";

export const runtime = "nodejs";

const isAuthenticated = async () => {
  const cookieStore = await cookies();

  return verifyAdminSession(cookieStore.get(adminSessionCookieName)?.value);
};

export async function GET() {
  if (!(await isAuthenticated())) {
    return Response.json({ error: "Non autorisé." }, { status: 401 });
  }

  return Response.json({
    hasSavedState: await hasStoredAdminState(),
    state: await readAdminState(),
  });
}

export async function PUT(request: Request) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: "Non autorisé." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const state = normalizeAdminState(body);

  await writeAdminState(state);

  return Response.json({ ok: true, state });
}
